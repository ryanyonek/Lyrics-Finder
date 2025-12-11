import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

function capitalizeAfterNewline(text) {
  // Split the text into an array of lines
  const lines = text.split('\\n');
  console.log(`Lines: ${lines}`);

  // Map over each line to capitalize its first letter
  const capitalizedLines = lines.map(line => {
    if (line.length === 0) {
      return ''; // Return empty string for empty lines
    }
    // Capitalize the first letter and concatenate with the rest of the line
    return line.charAt(0).toUpperCase() + line.slice(1);
  });

  // Join the capitalized lines back together with new line characters
  return capitalizedLines.join('\\n');
}

function capitalizeAfterPunctuationAndNewline(text) {
  return text.replace(/(?<=[.?!]\s*|^)\w/g, char => char.toUpperCase());
}

function uppercaseAfterLineBreaks(text) {
  // The regex matches a newline character (\n) followed by any character (.).
  // The 'g' flag ensures all occurrences are replaced, not just the first.
  // The 'm' flag allows '^' and '$' to match the start/end of lines,
  // but in this case, we explicitly match '\n'.
  return text.replace(/(.)(\n)/g, (match, newline, char) => {
    return newline + char.toUpperCase();
  });
} 


app.get("/", (req, res) => {
    res.render("index.ejs", {
        error: "No lyrics found",
    });
});

app.post("/submit", async (req, res) => {
    try {
        console.log(req.body);
        const artist = req.body.artist.replaceAll(" ", "_");
        const title = req.body.title.replaceAll(" ", "_");
        const response = await axios.get(`https://private-anon-e17e78d90b-lyricsovh.apiary-proxy.com/v1/${artist}/${title}`);
        //console.log(`Before: ${JSON.stringify(response.data.lyrics)}`);
        var lyrics = JSON.stringify(response.data.lyrics);
        const lyrics2 = lyrics.replaceAll("\"", "");
        const capitalizedLyrics = lyrics2.charAt(0).toUpperCase() + lyrics2.slice(1);
        const capitalizedLyrics2 = capitalizeAfterNewline(capitalizedLyrics);
        const capitalizedLyrics3 = capitalizeAfterPunctuationAndNewline(capitalizedLyrics2);
        const capitalizedLyrics4 = uppercaseAfterLineBreaks(capitalizedLyrics3);
        const spacedCapitalizedLyrics = capitalizedLyrics4.replaceAll("\\r\n", "<br>");
        const spacedCapitalizedLyrics2 = spacedCapitalizedLyrics.replaceAll("\\n", "<br>");
        const spacedCapitalizedLyrics3 = spacedCapitalizedLyrics2.replaceAll("\\r", "<br>");
        const spacedCapitalizedLyrics4 = spacedCapitalizedLyrics3.replaceAll("\\", "\"");
        const lyricsFixed = spacedCapitalizedLyrics4;
        //console.log(`After: ${lyricsFixed}`);
        res.render("index.ejs", {
            artist: artist.replaceAll("_", " "),
            title: title.replaceAll("_", " "),
            lyrics: lyricsFixed,
        });
  } catch (error) {
    console.log(error);
    res.status(500);
    res.render("index.ejs", {
        error: JSON.stringify(error.response.data.error),
    });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});