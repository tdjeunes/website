document.addEventListener('DOMContentLoaded', function() {
  // Create a new div element for the archived message
  const archivedMessageDiv = document.createElement('div');
  archivedMessageDiv.id = 'archived-message-block';
  
  // Fetch the archived message content from the URL
  fetch('https://contenu.terredesjeunes.org/api/v1/archived-message.json')
    .then(response => response.json())
    .then(data => {
        // Set the fetched message content as the inner text of the archived message div
        archivedMessageDiv.innerHTML = data.message;
    })
    .catch(error => {
        console.error('Error fetching archived message:', error);
    });
  
  // Apply inline styles to the archived message div  // Apply inline styles to the archived message div
  archivedMessageDiv.style.backgroundColor = 'rgb(241 226 75)'; // Red background color
  archivedMessageDiv.style.padding = '20px'; // Padding around the text
  archivedMessageDiv.style.border = '2px solid rgb(37 30 31)'; // Border
  archivedMessageDiv.style.textAlign = 'center'; // Center-align the text
  archivedMessageDiv.style.fontWeight = 'bold'; // Make the text bold
  
  // Find the target div in the page
  const targetDiv = document.querySelector('#page.page');

  // Insert the archived message div before the target div
  targetDiv.parentNode.insertBefore(archivedMessageDiv, targetDiv);
});