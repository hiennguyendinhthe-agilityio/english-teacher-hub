with open('vite.config.js', 'r') as f:
    content = f.read()

old = "export default defineConfig({"
new = """export default defineConfig({
  define: {
    // ponytail: hardcoded for production since .env.* is gitignored
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
      process.env.VITE_API_BASE_URL || 'https://english-teacher-hub.onrender.com/api/v1'
    ),
  },"""

content = content.replace(old, new)
with open('vite.config.js', 'w') as f:
    f.write(content)
print("Done")
