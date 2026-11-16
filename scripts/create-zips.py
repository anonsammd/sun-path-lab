import os
import zipfile

def zip_directory(folder_path, output_zip_path, exclude_dirs=None, exclude_files=None, exclude_extensions=None):
    exclude_dirs = set(exclude_dirs or [])
    exclude_files = set(exclude_files or [])
    exclude_extensions = set(exclude_extensions or ['.zip'])
    
    with zipfile.ZipFile(output_zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(folder_path):
            # Modify dirs in-place to skip excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                # Never include environment files or secret credentials
                if file == '.env' or file.startswith('.env.') or file in exclude_files:
                    continue
                if any(file.endswith(ext) for ext in exclude_extensions):
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, folder_path)
                zf.write(file_path, arcname)
    
    size_mb = os.path.getsize(output_zip_path) / (1024 * 1024)
    print(f"Created {output_zip_path} ({size_mb:.2f} MB)")

def main():
    print("📦 Creating deployment and source zip archives...")

    # 1. Dist / Publish folder zip for Netlify drag and drop (Clean static + client assets)
    if os.path.exists('dist'):
        zip_directory('dist', 'sunpathlab-dist.zip')
    
    # 2. Source code zip (clean, no node_modules, dist, or secrets, perfect for GitHub / Netlify Git import)
    exclude_dirs = {'node_modules', '.astro', 'dist', '.netlify', '.git', '__pycache__', 'design-system'}
    exclude_files = {'.env', 'sunpathlab-dist.zip', 'sunpathlab-source.zip'}
    zip_directory('.', 'sunpathlab-source.zip', exclude_dirs, exclude_files)

    print("✅ All archives generated and secured successfully!")

if __name__ == '__main__':
    main()
