const { Project } = require("ts-morph");

const project = new Project({
  tsConfigFilePath: "tsconfig.json"
});

const sourceFiles = project.getSourceFiles();
console.log(`Processing ${sourceFiles.length} files...`);

for (const sourceFile of sourceFiles) {
  const filePath = sourceFile.getFilePath();
  // We only care about src/ and supabase/
  if (filePath.includes('/src/') || filePath.includes('/supabase/functions/')) {
    sourceFile.fixUnusedIdentifiers();
  }
}

project.saveSync();
console.log("Unused identifiers fixed.");
