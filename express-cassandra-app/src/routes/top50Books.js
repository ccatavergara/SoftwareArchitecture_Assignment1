const express = require('express');
const router = express.Router();
const client = require('../db');
const redisClient = require('../cacheDb');


async function getTop50Books() {
  const cachedBooks = await redisClient.getAsync('books');
  if (cachedBooks) {
    return JSON.parse(cachedBooks);
  }
  const query = 'SELECT * FROM books';
  const result = await client.execute(query, { prepare: true });
  redisClient.setAsync('books', JSON.stringify(result.rows));
  return result.rows;
}

async function getTopBooksSales(){
  const cachedSales = await redisClient.getAsync('salesByYear');
  if (cachedSales) {
    return JSON.parse(cachedSales);
  }
  const query = 'SELECT * FROM sales_by_year';
  const result = await client.execute(query, { prepare: true });
  redisClient.setAsync('salesByYear', JSON.stringify(result.rows));
  return result.rows;
}

function getTop5SalesForYear(year,sales){
  const actualYearSales = sales.filter(sale => sale.year === year);
  const orderedSales = actualYearSales.sort((a,b) => b.sales - a.sales);
  return orderedSales.slice(0,5);
}

async function getAuthorBooks(authorId){
  const cachedBooks = await redisClient.getAsync('books');
  if (cachedBooks) {
    return JSON.parse(cachedBooks).filter(book => book.author === authorId);
  }
  const query = 'SELECT * FROM books WHERE author = ? ALLOW FILTERING';
  const result = await client.execute(query, [authorId], { prepare: true });
  return result.rows;
}

async function getAuthorSales(authorId){
  const authorBooks = await getAuthorBooks(authorId).then(
    books => books
  ).catch((error) => {
    console.error('Error fetching author books:', error);
  });
  let totalSales = 0;
  authorBooks.forEach(book => totalSales += book.number_of_sales);
  return totalSales;
}
  


router.get('/top50Books', async (req, res) => {
  try {
    const cachedTopBooks = await redisClient.getAsync('top50Books');
    const cachedSales = await redisClient.getAsync('salesByYear');
    const cachedBooks = await redisClient.getAsync('books');
    conditions = [cachedTopBooks, cachedSales, cachedBooks].map(condition => condition !== null);
    if (conditions.every(condition => condition)) {
      return res.status(200).send({books: JSON.parse(cachedTopBooks)});
    }
    const books = await getTop50Books();
    const sales = await getTopBooksSales();
    const ordererBooks = books.sort((a,b) => b.number_of_sales - a.number_of_sales);
    const top5BooksPerYear = [];
    const years = new Set();
    books.forEach(book => years.add(book.date_of_publication.year));
    years.forEach(year => {
      top5BooksPerYear.push({
        year: year,
        top5: getTop5SalesForYear(year,sales)
      });
    })
    const top50Books = ordererBooks.slice(0,50);

    const finalResponse = await Promise.all(top50Books.map(async book => {
      const authorSales = await getAuthorSales(book.author);
      const yearData = top5BooksPerYear.find(year => year.year === book.date_of_publication.year);
      const wasBestSeller = yearData ? yearData.top5.some(topBook => topBook.book === book.id) : false;
     
      return {
        id: book.id,
        name: book.name,
        sales: book.number_of_sales,
        authorSales: authorSales,
        yearBestSeller: wasBestSeller,
      };
    }));
    redisClient.setAsync('top50Books', JSON.stringify(finalResponse));
    res.status(200).send({books: finalResponse});
  } catch (error) {
    console.error('Error fetching top 50 books:', error);
    res.status(500).send({ error: 'Error fetching top 50 books: ' + error.message });
  }
});


module.exports = router;