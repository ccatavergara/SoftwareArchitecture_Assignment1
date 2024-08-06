document.addEventListener('DOMContentLoaded', () => {
    fetchAuthorInfo();
    // fetch10Books();
  })


  async function fetchAuthorInfo() {
    try{
      const response = await fetch('/api/tables');
      const data = await response.json();
    //   const info = data.authorData;
      const infoList = document.getElementById('authors-info');
      infoList.innerHTML = '';
      data.forEach(row => {
        const listItem = document.createElement('tr');
        listItem.innerHTML = `
          <td>${row.author}</td>
          <td>${row.numBooks}</td>
          <td>${row.avgScore.toFixed(2)}</td>
          <td>${row.totalSales}</td>
        `;
        infoList.appendChild(listItem);
      });
    } catch (error) {
      console.error('Error fetching information:', error);
    }
  }


// async function fetch10Books() {
//     try{
//         const response = await fetch('/api/tables');
//         const data = await response.json();
//         const info = data.topRatedBooks;
//         const booksList = document.getElementById('top-rated-books');
//         booksList.innerHTML = '';
//         info.forEach(book => {
//             const listItem = document.createElement('tr');
//             listItem.innerHTML = `
//                 <td>${book.bookName}</td>
//                 <td>${book.avgScore.toFixed(2)}</td>
//                 <td>${book.highestRatedReview.review}</td>
//                 <td>${book.highestRatedReview.score}</td>
//                 <td>${book.highestRatedReview.number_of_upvotes}</td>
//                 <td>${book.lowestRatedReview.review}</td>
//                 <td>${book.lowestRatedReview.score}</td>
//                 <td>${book.lowestRatedReview.number_of_upvotes}</td>
//             `;
//             booksList.appendChild(listItem);
//         });
//     } catch (error) {
//         console.error('Error fetching top rated books:', error);
//     }
// }
