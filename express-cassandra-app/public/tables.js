document.addEventListener('DOMContentLoaded', () => {
    fetchAuthorInfo();
    // fetch10Books();
  })


  async function fetchAuthorInfo() {
    try{
      const response = await fetch('/api/tables');
      const data = await response.json();
    //   const info = data.authorData;
      console.log(data);
      let grid = new gridjs.Grid({
        columns : ['Author', 'Number of Books', 'Average Score', 'Total sales'],
        sort: true,
        search:true,
        data : data.map((author) => {
            return [author.author, author.numBooks, author.avgScore.toFixed(2), author.totalSales];
        }),
      }).render(document.getElementById('author-info'));
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
