
function getTop50Books(){
    return fetch('/api/top50Books').then((response) => {
        return response.json();
        
    }).catch((errr) => {
        return errr;
    });
}


document.addEventListener('DOMContentLoaded', () => {
    getTop50Books().then((data) => {
        let books = data.books;
        console.log(books);
        let grid = new gridjs.Grid({
            columns: ['Title', 'Total Sales', 'Author Total Sales', 'Top 5 Pubilshed Year'],
            data : books.map((book) => {
                return [book.name, book.sales, book.authorSales, book.wasBestSeller ? 'Yes' : 'No'];
            }),
            pagination: {
                limit: 10
            }
        }).render(document.getElementById('wrapper'));
    }).catch((error) => {
        console.error('Error fetching top 50 books:', error);
    });
});
