// src_ts/generate-blog.ts
import fs from 'fs-extra';
import path from 'path';
import MarkdownIt from 'markdown-it';
import matter from 'gray-matter'; // gray-matter should work with esModuleInterop

// Helper to get project root in ESM, as __dirname behavior changes
// when running from dist/ folder after compilation.
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirnameFromDist = path.dirname(__filename); // This will be /path/to/project/dist
const projectRoot = path.resolve(__dirnameFromDist); // Correctly points to /path/to/project

const md = new MarkdownIt({ html: true });

// Define paths relative to projectRoot
const articlesDir = path.join(projectRoot, '_articles');
const outputDir = path.join(projectRoot, '_site');
const articlesOutputDir = path.join(outputDir, 'articles');

interface Frontmatter {
  title?: string;
  date?: string; // Consider using Date type and formatting if more complex date logic is needed
  author?: string;
  // Add any other frontmatter fields you expect
}

interface ArticleData extends Frontmatter {
  path: string; // Path relative to _site root
  fileName: string;
}

// Basic HTML template for individual articles
const articleTemplate = (articleData: ArticleData, contentHtml: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${articleData.title || 'SkinFent Article'} - SkinFent.gg Blog</title>
    <link rel="stylesheet" href="../styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { padding-top: 20px; } /* Add some top padding */
        .article-content-wrapper {
            max-width: 800px;
            margin: 20px auto;
            padding: 25px;
            background: #080000; /* Darker than main site body for contrast */
            border: 2px dashed #FF0000;
            color: #00CC00; /* Slightly different green */
            box-shadow: 0 0 15px #FF0000;
        }
        .article-content-wrapper h1, .article-content-wrapper h2, .article-content-wrapper h3 {
            color: #FFFF00; /* Yellow headings */
            text-shadow: 0 0 3px #FF0000;
            margin-bottom: 0.75em;
        }
        .article-content-wrapper p { margin-bottom: 1em; line-height: 1.6; }
        .article-content-wrapper a { color: #00FF00; text-decoration: underline; }
        .article-content-wrapper a:hover { color: #FFFF00; }
        .article-content-wrapper ul, .article-content-wrapper ol { margin-left: 20px; margin-bottom: 1em; }
        .article-content-wrapper blockquote {
            border-left: 3px solid #FF0000;
            padding-left: 15px;
            margin-left: 0;
            font-style: italic;
            color: #AAAA00;
        }
        .article-content-wrapper pre {
            background: #000;
            border: 1px solid #FF0000;
            padding: 10px;
            overflow-x: auto;
            color: #00FF00;
            text-shadow: none;
        }
        .article-content-wrapper code {
            font-family: 'Courier New', Courier, monospace;
        }
        .article-meta { color: #888800; font-size: 0.9em; margin-bottom: 20px; }
        .back-to-blog { display: inline-block; margin-top: 30px; padding: 8px 15px; background: #5a0000; color: #FFFF00; text-decoration: none; border: 1px solid #FF0000; }
        .back-to-blog:hover { background: #FF0000; color: #000; }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div class="header-content">
                <a href="/" class="logo">
                    <i class="fas fa-skull"></i>
                    <h1>SKIN<span>FENT</span>.GG</h1>
                </a>
                <div class="nav-links">
                    <a href="/"><i class="fas fa-home"></i> Home</a>
                    <a href="/blog"><i class="fas fa-newspaper"></i> Blog</a>
                </div>
            </div>
        </div>
    </header>

    <div class="article-content-wrapper">
        <h1>${articleData.title || 'Untitled Article'}</h1>
        <p class="article-meta">
            ${articleData.date ? `Published: ${(new Date(articleData.date)).toDateString()}` : ''}
            ${articleData.author ? ` by ${articleData.author}` : ''}
        </p>
        <hr style="border-color: #550000; margin-bottom: 20px;">
        ${contentHtml}
        <a href="/blog" class="back-to-blog">« Back to Blog Index</a>
    </div>

    <footer>
        <div class="container">
            <div class="copyright" style="padding-top:20px;">
                © 202X SkinFent.gg - Your Wallet Is Our Plaything. All Wrongs Reserved.
            </div>
        </div>
    </footer>
</body>
</html>`;

// Basic HTML template for the blog index page
const blogIndexTemplate = (articles: ArticleData[]): string => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SkinFent.gg - Blog of Horrors</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { padding-top: 20px; }
        .blog-index-wrapper {
            max-width: 800px;
            margin: 20px auto;
            padding: 25px;
            background: #080000;
            border: 2px dashed #FF0000;
            box-shadow: 0 0 15px #FF0000;
        }
        .blog-index-wrapper h1 {
            color: #FFFF00;
            text-align: center;
            text-shadow: 0 0 5px #FF0000;
            margin-bottom: 30px;
            text-transform: uppercase;
        }
        .blog-index-list { list-style: none; padding: 0; }
        .blog-index-list li {
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px dotted #550000;
        }
        .blog-index-list li:last-child { border-bottom: none; }
        .blog-index-list h2 { margin: 0 0 5px 0; }
        .blog-index-list h2 a {
            color: #00FF00;
            text-decoration: none;
            font-size: 1.5em;
        }
        .blog-index-list h2 a:hover { color: #FFFF00; text-decoration: underline; }
        .blog-index-list p { font-size: 0.9em; color: #AAAA00; margin: 5px 0 0 0; }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div class="header-content">
                <a href="/" class="logo">
                    <i class="fas fa-skull"></i>
                    <h1>SKIN<span>FENT</span>.GG</h1>
                </a>
                <div class="nav-links">
                    <a href="/"><i class="fas fa-home"></i> Home</a>
                    <a href="/blog"><i class="fas fa-newspaper"></i> Blog</a>
                </div>
            </div>
        </div>
    </header>

    <div class="blog-index-wrapper">
        <h1>Blog of Digital Despair</h1>
        <ul class="blog-index-list">
            ${articles.map(article => `
                <li>
                    <h2><a href="${article.path}">${article.title || 'Untitled Article'}</a></h2>
                    <p>
                        ${article.date ? `Published: ${article.date}` : ''}
                        ${article.author ? ` by ${article.author}` : ''}
                    </p>
                </li>
            `).join('')}
        </ul>
    </div>

    <footer>
        <div class="container">
            <div class="copyright" style="padding-top:20px;">
                © 202X SkinFent.gg - Your Wallet Is Our Plaything. All Wrongs Reserved.
            </div>
        </div>
    </footer>
</body>
</html>`;

async function buildBlog(): Promise<void> {
    // Clear old output and create directories
    await fs.emptyDir(outputDir);
    await fs.ensureDir(articlesOutputDir);
    console.log(`Cleaned and ensured output directories: ${outputDir}, ${articlesOutputDir}`);

    // Copy static assets from projectRoot to outputDir
    const staticAssetsToCopy = ['index.html', 'styles.css', 'script.js'];
    // If you have a separate script.js or an images folder, add them here:
    // const staticAssetsToCopy = ['index.html', 'global.css', 'script.js'];
    // const imageDir = path.join(projectRoot, 'images');

    for (const asset of staticAssetsToCopy) {
        const assetSourcePath = path.join(projectRoot, asset);
        const assetDestPath = path.join(outputDir, asset);
        if (await fs.pathExists(assetSourcePath)) {
            await fs.copy(assetSourcePath, assetDestPath);
            console.log(`Copied static asset: ${assetSourcePath} to ${assetDestPath}`);
        } else {
            console.warn(`Static asset not found, skipping: ${assetSourcePath}`);
        }
    }

    // Example for copying an 'images' folder:
    const imagesSourceDir = path.join(projectRoot, 'images');
    const imagesDestDir = path.join(outputDir, 'images');
    if (await fs.pathExists(imagesSourceDir)) {
      await fs.copy(imagesSourceDir, imagesDestDir);
      console.log(`Copied images folder: ${imagesSourceDir} to ${imagesDestDir}`);
    }


    const articleFiles = await fs.readdir(articlesDir);
    const articlesData: ArticleData[] = [];

    for (const file of articleFiles) {
        if (path.extname(file) === '.md') {
            const filePath = path.join(articlesDir, file);
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const { data, content: mdContent } = matter(fileContent);

            const frontmatter = data as Frontmatter; // Type assertion for frontmatter

            const htmlContent = md.render(mdContent);
            const baseName = path.basename(file, '.md');
            const outputFilePath = path.join(articlesOutputDir, `${baseName}.html`);

            const currentArticleData: ArticleData = {
                ...frontmatter, // Spread recognized frontmatter fields
                title: frontmatter.title,
                date: frontmatter.date,
                author: frontmatter.author,
                path: `articles/${baseName}`,
                fileName: baseName,
            };

            const fullHtml = articleTemplate(currentArticleData, htmlContent);
            await fs.writeFile(outputFilePath, fullHtml);

            articlesData.push(currentArticleData);
            console.log(`Processed and wrote article: ${outputFilePath}`);
        }
    }

    // Sort articles by date (newest first)
    articlesData.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        if (isNaN(dateA) || isNaN(dateB)) { // Handle invalid dates gracefully
            return isNaN(dateA) ? 1 : -1; // Push invalid dates to the end or beginning
        }
        return dateB - dateA;
    });

    // Generate blog.html (index page)
    const blogIndexHtml = blogIndexTemplate(articlesData);
    const blogIndexPath = path.join(outputDir, 'blog.html');
    await fs.writeFile(blogIndexPath, blogIndexHtml);
    console.log(`Generated blog index: ${blogIndexPath}`);

    console.log('Blog built successfully to _site directory!');
}

buildBlog().catch(err => {
    console.error("Error building blog:", err);
    process.exit(1);
});