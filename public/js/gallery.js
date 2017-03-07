/* global $:true  document:true, d3:true, _:true*/

$(document).ready(() => {
  console.log('Gallery ready');
  const memesArray = $('.pageMemes').text().split(',');
  const numberOfMemes = memesArray.length;

  // Build galler
  for (const meme of memesArray) {
    const thisLine = `<img class="gallery-meme" data-image="${meme}" src="../images/meme-images/${meme}.png" />`;
    $('#gallery').append(thisLine);
  }
});
