import zlib
import struct
import math
import os

def create_png(width, height, draw_func, filepath):
    # PNG signature
    png_signature = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0) # 8-bit RGBA
    ihdr_crc = struct.pack('>I', zlib.crc32(b'IHDR' + ihdr_data))
    ihdr_chunk = struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + ihdr_crc
    
    # Raw RGBA image data with scanline filter byte 0
    raw_lines = []
    for y in range(height):
        line = bytearray([0]) # Filter byte 0 (None)
        for x in range(width):
            r, g, b, a = draw_func(x, y, width, height)
            line.extend([r, g, b, a])
        raw_lines.append(bytes(line))
        
    raw_data = b''.join(raw_lines)
    compressed_data = zlib.compress(raw_data, 9)
    
    # IDAT chunk
    idat_crc = struct.pack('>I', zlib.crc32(b'IDAT' + compressed_data))
    idat_chunk = struct.pack('>I', len(compressed_data)) + b'IDAT' + compressed_data + idat_crc
    
    # IEND chunk
    iend_crc = struct.pack('>I', zlib.crc32(b'IEND'))
    iend_chunk = struct.pack('>I', 0) + b'IEND' + iend_crc
    
    with open(filepath, 'wb') as f:
        f.write(png_signature + ihdr_chunk + idat_chunk + iend_chunk)
    print(f"Generated: {filepath} ({width}x{height})")

def pwa_icon_pixel(x, y, w, h, is_maskable=False):
    # Normalized coordinates 0.0 to 1.0
    nx = x / (w - 1)
    ny = y / (h - 1)
    
    # Rounded rectangle background
    corner_radius = 0.0 if is_maskable else 0.22
    # Check if point is inside rounded rect
    dx = max(0, abs(nx - 0.5) - (0.5 - corner_radius))
    dy = max(0, abs(ny - 0.5) - (0.5 - corner_radius))
    dist = math.sqrt(dx*dx + dy*dy)
    
    if dist > corner_radius and not is_maskable:
        # Anti-aliasing edge
        edge = dist - corner_radius
        if edge > 0.02:
            return 0, 0, 0, 0
        alpha = int(255 * (1.0 - edge / 0.02))
    else:
        alpha = 255
        
    # Gradient: Indigo (#6366f1) to Purple (#8b5cf6) to Pink (#ec4899)
    t = (nx + ny) / 2.0
    if t < 0.5:
        # Indigo to Purple
        sub_t = t / 0.5
        r = int(99 + (139 - 99) * sub_t)
        g = int(102 + (92 - 102) * sub_t)
        b = int(241 + (246 - 241) * sub_t)
    else:
        # Purple to Pink
        sub_t = (t - 0.5) / 0.5
        r = int(139 + (236 - 139) * sub_t)
        g = int(92 + (72 - 92) * sub_t)
        b = int(246 + (153 - 246) * sub_t)
        
    # Draw open book symbol in center (approx region 0.25 to 0.75)
    cx = nx - 0.5
    cy = ny - 0.5
    
    # Left & Right page of open book
    in_left_page = (-0.22 <= cx <= -0.02) and (-0.18 <= cy <= 0.20)
    in_right_page = (0.02 <= cx <= 0.22) and (-0.18 <= cy <= 0.20)
    
    if in_left_page or in_right_page:
        # White book pages with slight gradient
        page_shade = 255 - int(abs(cx) * 50)
        return page_shade, page_shade, 255, alpha
        
    # Center spine
    if abs(cx) <= 0.015 and (-0.18 <= cy <= 0.20):
        return 129, 140, 248, alpha
        
    # Star sparkle above book
    star_dist = math.sqrt(cx*cx + (cy + 0.25)*(cy + 0.25))
    if star_dist < 0.06:
        # 4-point star shape
        star_ang = abs(math.sin(math.atan2(cy + 0.25, cx) * 2))
        if star_dist < 0.02 + 0.04 * star_ang:
            return 254, 240, 138, alpha
            
    return r, g, b, alpha

def main():
    public_dir = os.path.join(os.path.dirname(__file__), '..', 'public')
    os.makedirs(public_dir, exist_ok=True)
    
    create_png(192, 192, lambda x, y, w, h: pwa_icon_pixel(x, y, w, h, False), os.path.join(public_dir, 'icon-192.png'))
    create_png(512, 512, lambda x, y, w, h: pwa_icon_pixel(x, y, w, h, False), os.path.join(public_dir, 'icon-512.png'))
    create_png(512, 512, lambda x, y, w, h: pwa_icon_pixel(x, y, w, h, True), os.path.join(public_dir, 'icon-maskable-512.png'))
    create_png(180, 180, lambda x, y, w, h: pwa_icon_pixel(x, y, w, h, False), os.path.join(public_dir, 'apple-touch-icon.png'))
    print("All PWA icons generated successfully!")

if __name__ == '__main__':
    main()
