async function fetchTop10Books() {
    try {
      const response = await fetch('/api/top10Books');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const top10Books = await response.json();
      console.log(top10Books);
      const booksList = document.getElementById('books-list');
      booksList.innerHTML = top10Books.map(book => `
        <tr>
          <td>${book.name}</td>
          <td>${book.averageScore.toFixed(2)}</td>
          <td>${book.highestRatedReview ? book.highestRatedReview.score : 'N/A'}</td>
          <td>${book.lowestRatedReview ? book.lowestRatedReview.score : 'N/A'}</td>
        </tr>
      `).join('');
    } catch (error) {
      console.error('Error fetching top 10 books:', error);
      document.getElementById('books-list').innerHTML = '<tr><td colspan="4">Error loading data</td></tr>';
    }
  }
  
  document.addEventListener('DOMContentLoaded', fetchTop10Books);
  