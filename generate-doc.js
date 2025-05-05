const fs = require("fs");
const path = require("path");

// Directories and files to include
const includePaths = ["src", "public", "package.json", ".env"];
const excludeDirs = ["node_modules", ".git", "build"];
const excludeExtensions = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".mp4"];
const outputFile = "ProjectDocumentation.md";

// Function to read files recursively
function readFiles(dir, relativePath = "") {
  let fileContent = "";

  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    const relativeFilePath = path.join(relativePath, entry.name);

    if (excludeDirs.includes(entry.name)) {
      return; // Skip excluded directories
    }

    if (entry.isDirectory()) {
      // Add directory name as heading
      fileContent += `\n## Directory: ${relativeFilePath}\n\n`;
      fileContent += readFiles(fullPath, relativeFilePath); // Recursively read subdirectories
    } else if (entry.isFile()) {
      // Skip excluded extensions
      const ext = path.extname(entry.name).toLowerCase();
      if (excludeExtensions.includes(ext)) {
        return;
      }

      // Add file name as subheading and its content
      const fileData = fs.readFileSync(fullPath, "utf-8");
      fileContent += `\n### File: ${relativeFilePath}\n\`\`\`\n${fileData}\n\`\`\`\n\n`;
    }
  });

  return fileContent;
}

// Generate documentation
function generateDocumentation() {
  let documentation = "# Project Documentation\n\n";

  includePaths.forEach((pathToInclude) => {
    if (fs.existsSync(pathToInclude)) {
      if (fs.lstatSync(pathToInclude).isDirectory()) {
        documentation += `\n# Directory: ${pathToInclude}\n\n`;
        documentation += readFiles(pathToInclude);
      } else {
        // Add individual file
        const fileData = fs.readFileSync(pathToInclude, "utf-8");
        documentation += `\n# File: ${pathToInclude}\n\`\`\`\n${fileData}\n\`\`\`\n\n`;
      }
    }
  });

  // Write to output file
  fs.writeFileSync(outputFile, documentation);
  console.log(`Documentation written to ${outputFile}`);
}

generateDocumentation();
