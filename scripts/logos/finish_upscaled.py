"""Post-process the EDSR x4 upscales of the owner's own logos.

Input : <dir>/<name>_x4_raw.png   (name in rouge, vert, orne, femmes)
Output: <out>/<final>-4x.png plus -2048.jpg / -1024.jpg (q94)  — design untouched, texts untouched.
Only extra step: leftover AI-watermark on the red logo is inpainted, then a very mild unsharp mask.
"""
import sys
import cv2
import numpy as np

raw_dir, out_dir = sys.argv[1], sys.argv[2]
FINAL = {
    "rouge": "logo-hafs-men-red",
    "vert": "logo-green-men",
    "orne": "logo-ornate-men",
    "femmes": "logo-ornate-women",
}


def unsharp(img, amount=0.35, sigma=1.4):
    blur = cv2.GaussianBlur(img, (0, 0), sigma)
    return cv2.addWeighted(img, 1 + amount, blur, -amount, 0)


for key, final in FINAL.items():
    try:
        im = cv2.imread(f"{raw_dir}/{key}_x4_raw.png")
    except Exception:
        continue
    if im is None:
        print("missing", key)
        continue
    if key == "rouge":
        # Bottom-left corner: first-pass inpaint left a soft band and the watermark glyphs sit right of it.
        # Rebuild by mirroring the clean texture above, and let Poisson blending hide every seam.
        H = 2560
        def clone(dst, src_patch, y0, y1, x0, x1):
            m = np.zeros(src_patch.shape[:2], np.uint8)
            m[:] = 255
            m[:, :6] = 0; m[-6:, :] = 0; m[:6, :] = 0 if y0 > 0 else m[:6, :]
            full = dst.copy()
            full[y0:y1, x0:x1] = src_patch
            mask = np.zeros(dst.shape[:2], np.uint8)
            mask[y0 + 6:y1 - 6, x0 + 6:x1 - 6] = 255
            center = ((x0 + x1) // 2, (y0 + y1) // 2)
            return cv2.seamlessClone(full, dst, mask, center, cv2.NORMAL_CLONE)
        im = clone(im, np.flipud(im[2240:2400, 0:600]).copy(), 2400, 2560, 0, 600)
        # watermark glyphs: replace with clean texture from the mirrored block just left of them
        im = clone(im, im[2478:2556, 330:560].copy(), 2478, 2556, 590, 820)
    if key == "rouge":
        im[2554:, :1000] = im[2553:2554, :1000]   # drop the 6px un-blended border strip
    im = unsharp(im)
    cv2.imwrite(f"{out_dir}/{final}-4x.png", im)
    for size in (2048, 1024):
        small = cv2.resize(im, (size, size), interpolation=cv2.INTER_AREA)
        cv2.imwrite(f"{out_dir}/{final}-{size}.jpg", small, [cv2.IMWRITE_JPEG_QUALITY, 94])
    print("ok", key, im.shape)
