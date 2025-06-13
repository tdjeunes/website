// Provide a function to map unoptimized-to-optimized image URLs.

/**
 * Function to load and process image data
 *
 * @param {string} imageServerDomain - The domain of the image server
 *   For example 'https://images.example.com/' or 'http://localhost:8705/'.
 * @param {string} imageFileUrl - The URL of the JSON file containing the image
 *   mapping. For example '/unversioned-image-mapping.json'.
 */
 function loadImages(imageServerDomain, imageFileUrl) {
  // Select all <img> elements with data-optimized-size attribute and src
  // should begins with /media in the document.
  const optimizedImages = document.querySelectorAll('img[data-optimized-size][src^="/media"]');
  // collect elements which has style background-image: url() and store it globally
  // we can later replace with optimized image urls
  collectBackgroundImageElements();

  // Fetch the JSON file once
  fetch(imageFileUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch JSON');
      }
      return response.json();
    })
    .then(mappingData => {
      // Store mappingData globally to access in news block
      globalMappingData = mappingData;
      // Iterate over each <img> element
      optimizedImages.forEach(img => {
        optimizeImage(img, mappingData, imageServerDomain);
      });
      // replace optimized images mentioned in styles. ex:- background-image: url(/media/cameroun_9.jpg)
      if (window.bgImageElements) {
        window.bgImageElements.forEach((item, index) => {
          // assuming width always 100%
          const newoptimizedUrl = getOptimizedImageUrl(item.imageName, item.dataSize, mappingData, imageServerDomain);
          if (newoptimizedUrl != "") {
            item.element.style.backgroundImage = `url(${newoptimizedUrl})`;
          }
        });
      }
    })
    .catch(error => {
      console.error('Error fetching or processing JSON:', error);
      // Optionally handle error, e.g., set a fallback image for all images
    });
}

/**
 * Extracts the image source if it starts with '/media'.
 * @param {HTMLImageElement} img - The image element.
 * @returns {string|null} - The valid image source or null.
 */
function getImageSource(img) {
  const dataSrc = img.getAttribute('src');
  if (!dataSrc) return null;
  return dataSrc;
}

/**
 * Extracts the image size.
 * @param {HTMLImageElement} img - The image element.
 * @returns {string|null} - The valid image size or null.
 */
function getImageSize(img) {
  const dataSize = img.getAttribute('data-optimized-size');
  if (!dataSize) return null;
  return dataSize;
}

/**
 * Constructs the optimized image URL using mapping data and dimensions.
 * Falls back to original image source if optimized version is not found.
 * @param {string} dataSrc - Original image source.
 * @param {number} dataSize - widthxheight of the image.
 * @param {Object} mappingData - Mapping of original to optimized image URLs.
 * @param {string} imageServerDomain - Domain for optimized images.
 * @returns {string} - Optimized image URL.
 */
function getOptimizedImageUrl(dataSrc, dataSize, mappingData, imageServerDomain) {
  const optimizedSrc = mappingData[dataSrc.replace('/media', '')];
  if (optimizedSrc && optimizedSrc[dataSize]) {
    return imageServerDomain + optimizedSrc[dataSize];
  }
  console.warn("Optimized image path not found for size:", dataSize);
  return "";
}

/**
 * Optimizes the image source by calculating its size and replacing it
 * with a mapped, optimized URL if available.
 * @param {HTMLImageElement} img - The image element.
 * @param {Object} mappingData - Image size to URL mapping data.
 * @param {string} imageServerDomain - Domain for optimized image assets.
 */
function optimizeImage(img, mappingData, imageServerDomain) {
  const dataSrc = getImageSource(img);
  if (!dataSrc) return;
  const dataSize = getImageSize(img);
  if (!dataSize) return;

  const optimizedUrl = getOptimizedImageUrl(dataSrc, dataSize, mappingData, imageServerDomain);
  if (optimizedUrl != "") {
    img.src = optimizedUrl;
  }
}

/**
 * Collects all DOM elements that have a `background-image` set via CSS,
 * extracts useful information (URL, image name, dimensions),
 * and stores the result globally in `window.bgImageElements`.
 *
 * Properties stored for each matched element:
 * - element: The actual DOM element reference.
 * - backgroundImage: Full background image URL as a string.
 * - imageName: Extracted image filename from the URL (e.g., "banner.jpg").
 * - width: Rendered width in pixels.
 * - height: Rendered height in pixels.
 *
 * @example
 * collectBackgroundImageElements();
 * console.log(window.bgImageElements);
 *
 * @global
 * @returns {void}
 */
function collectBackgroundImageElements() {
  // Define global store
  window.bgImageElements = [];

  // Select all elements that have a background image
  const elementsWithBgAndDataOptimizedSize = [...document.querySelectorAll('*')].filter(el => {
    const bg = window.getComputedStyle(el).getPropertyValue('background-image');
    const hasOptimizedSize = el.hasAttribute('data-optimized-size');

    return bg && bg !== 'none' && bg.includes('url(') && hasOptimizedSize;
  });

  // Store data globally
  elementsWithBgAndDataOptimizedSize.forEach((el) => {
    const computedStyle = window.getComputedStyle(el);
    const bgImage = computedStyle.getPropertyValue('background-image');

    // Extract the image URL
    const urlMatch = bgImage.match(/url\(["']?(.*?)["']?\)/);
    const imageUrl = urlMatch ? urlMatch[1] : null;
    if (imageUrl) {
      // Get path only (remove domain part)
      const pathOnly = imageUrl.startsWith('http') ? new URL(imageUrl).pathname : imageUrl;
      // Extract image name (e.g., from 'https://example.com/images/photo.jpg')
      const imageName = imageUrl ? imageUrl.split('/').pop().split('?')[0].split('#')[0] : null;

      const dataSize = el.getAttribute('data-optimized-size');
      // dataSize is set and background images start with /media.
      if (dataSize !== "" && pathOnly.startsWith("/media")) {
        // Store in global array
        window.bgImageElements.push({
          element: el,
          backgroundImage: imageUrl,
          imagePath: pathOnly,
          dataSize,
          imageName
        });
      }
    }
  });
}
