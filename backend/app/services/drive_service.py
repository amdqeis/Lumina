from dataclasses import dataclass

import httpx

DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files"
DRIVE_FILE_FIELDS = (
    "id,name,mimeType,thumbnailLink,webViewLink,"
    "imageMediaMetadata(width,height,cameraMake,cameraModel,"
    "focalLength,aperture,isoSpeed,exposureTime,location)"
)


@dataclass
class DriveFile:
    file_id: str
    name: str
    mime_type: str
    thumbnail_url: str | None
    view_url: str | None
    exif: dict | None


async def list_drive_photos(access_token: str, folder_id: str) -> list[DriveFile]:
    """
    Fetch all image files from a Google Drive folder using the user's OAuth token.
    Returns a list of DriveFile dataclasses with EXIF metadata when available.
    """
    query = f"'{folder_id}' in parents and mimeType contains 'image/' and trashed=false"
    files: list[DriveFile] = []
    page_token: str | None = None

    async with httpx.AsyncClient(trust_env=False) as client:
        while True:
            params: dict = {
                "q": query,
                "fields": f"nextPageToken,files({DRIVE_FILE_FIELDS})",
                "pageSize": 100,
            }
            if page_token:
                params["pageToken"] = page_token

            resp = await client.get(
                DRIVE_FILES_URL,
                params=params,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            resp.raise_for_status()
            data = resp.json()

            for item in data.get("files", []):
                exif_raw = item.get("imageMediaMetadata") or {}
                location = exif_raw.get("location") or {}
                exif = {
                    "camera_make": exif_raw.get("cameraMake"),
                    "camera_model": exif_raw.get("cameraModel"),
                    "focal_length": exif_raw.get("focalLength"),
                    "aperture": exif_raw.get("aperture"),
                    "iso_speed": exif_raw.get("isoSpeed"),
                    "shutter_speed": exif_raw.get("exposureTime"),
                    "width": exif_raw.get("width"),
                    "height": exif_raw.get("height"),
                    "latitude": location.get("latitude"),
                    "longitude": location.get("longitude"),
                } if exif_raw else None

                files.append(
                    DriveFile(
                        file_id=item["id"],
                        name=item.get("name", ""),
                        mime_type=item.get("mimeType", ""),
                        thumbnail_url=item.get("thumbnailLink"),
                        view_url=item.get("webViewLink"),
                        exif=exif,
                    )
                )

            page_token = data.get("nextPageToken")
            if not page_token:
                break

    return files
