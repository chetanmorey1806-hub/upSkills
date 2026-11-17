// Sample star-schema model for the DAX Lab.
export const Product = [
  { ProductID: 1, Product: 'Laptop', Category: 'Electronics', Price: 55000 },
  { ProductID: 2, Product: 'Mobile', Category: 'Electronics', Price: 18000 },
  { ProductID: 3, Product: 'Headphones', Category: 'Accessories', Price: 2500 },
  { ProductID: 4, Product: 'Keyboard', Category: 'Accessories', Price: 1500 },
  { ProductID: 5, Product: 'Office Chair', Category: 'Furniture', Price: 9000 },
  { ProductID: 6, Product: 'Desk', Category: 'Furniture', Price: 12000 },
];
export const Customer = [
  { CustomerID: 101, Customer: 'Asha Traders', City: 'Pune', Segment: 'Corporate' },
  { CustomerID: 102, Customer: 'Ravi Stores', City: 'Mumbai', Segment: 'Retail' },
  { CustomerID: 103, Customer: 'Neha Enterprises', City: 'Nagpur', Segment: 'Corporate' },
  { CustomerID: 104, Customer: 'Om Electronics', City: 'Pune', Segment: 'Retail' },
  { CustomerID: 105, Customer: 'Sai Furnishers', City: 'Mumbai', Segment: 'Corporate' },
  { CustomerID: 106, Customer: 'Kiran Mart', City: 'Nashik', Segment: 'Retail' },
];

// deterministic pseudo-random generator
let seed = 7;
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
export const Sales = [];
for (let i = 0; i < 60; i++) {
  const p = Product[Math.floor(rnd() * Product.length)];
  const c = Customer[Math.floor(rnd() * Customer.length)];
  const year = rnd() < 0.45 ? 2023 : 2024;
  const month = 1 + Math.floor(rnd() * 12);
  const day = 1 + Math.floor(rnd() * 28);
  const qty = 1 + Math.floor(rnd() * 5);
  const unit = Math.round(p.Price * (0.9 + rnd() * 0.2));
  const amount = qty * unit;
  Sales.push({
    OrderID: 1001 + i,
    OrderDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    Year: year,
    Month: month,
    CustomerID: c.CustomerID,
    ProductID: p.ProductID,
    Quantity: qty,
    UnitPrice: unit,
    SalesAmount: amount,
    Cost: Math.round(amount * (0.6 + rnd() * 0.2)),
  });
}
Sales.sort((a, b) => a.OrderDate.localeCompare(b.OrderDate));

// Date dimension (marked as date table): 2023-01-01 .. 2024-12-31
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const DateTable = [];
for (let t = Date.UTC(2023, 0, 1); t <= Date.UTC(2024, 11, 31); t += 86400000) {
  const d = new Date(t);
  const y = d.getUTCFullYear(), m = d.getUTCMonth() + 1;
  DateTable.push({
    Date: d.toISOString().slice(0, 10),
    Year: y,
    MonthNo: m,
    Month: MONTHS[m - 1],
    Quarter: 'Q' + Math.ceil(m / 3),
    YearMonth: `${y}-${String(m).padStart(2, '0')}`,
  });
}

export const MODEL = {
  tables: { Sales, Product, Customer, Date: DateTable },
  dateTable: { table: 'Date', column: 'Date' },
  // many-to-one relationships: fact column -> dim
  relationships: [
    { from: 'Sales', fromCol: 'ProductID', to: 'Product', toCol: 'ProductID' },
    { from: 'Sales', fromCol: 'CustomerID', to: 'Customer', toCol: 'CustomerID' },
    { from: 'Sales', fromCol: 'OrderDate', to: 'Date', toCol: 'Date' },
  ],
};
