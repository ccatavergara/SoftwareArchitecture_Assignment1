function fetchBooksByDescription(description) {
    return new Promise((resolve, reject) => {
        fetch(`/api/search?description=${description}`)
            .then(response => response.json())
            .then(books => resolve(books))
            .catch(error => reject(error));
    });
}
let grid;
function getBooksByDescription(e) {
    e.preventDefault();
    console.log("llegue a la funcion");
    const wrapper = document.getElementById('wrapper');
    wrapper.innerHTML = ''; // Clear the wrapper

    const description = document.getElementById('search').value;
    console.log(description);

    fetchBooksByDescription(description)
        .then(books => {
            console.log(books);
            if (books.length === 0) {
                wrapper.innerHTML = '<h2>No books found</h2>';
                return;
            }

            // If grid already exists, update its data
            if (grid) {
                grid.updateConfig({
                    data: books.map(book => [book.name, book.author, book.date_of_publication, book.number_of_sales, book.summary])
                }).forceRender();
            } else {
                // Create new grid if it doesn't exist
                grid = new gridjs.Grid({
                    columns: ['Title', 'Author', 'Published', 'Total Sales', 'Summary'],
                    data: books.map(book => [book.name, book.author, book.date_of_publication, book.number_of_sales, book.summary]),
                    pagination: {
                        limit: 5
                    }
                });

                // Render the grid after a short delay to ensure DOM is ready
                setTimeout(() => {
                    grid.render(wrapper);
                }, 0);
            }
        }).catch(error => { 
            console.error(error);
            wrapper.innerHTML = '<h2>Error fetching books</h2>';
        });
}


document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('searchButton');
    button.addEventListener('click', getBooksByDescription);
});
