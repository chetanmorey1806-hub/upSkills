const invSql = `CREATE DATABASE InventoryDB;
GO
USE InventoryDB;
GO
CREATE TABLE Categories (
    CategoryId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL UNIQUE
);
GO
CREATE TABLE Suppliers (
    SupplierId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Phone VARCHAR(15) NOT NULL
);
GO
CREATE TABLE Products (
    ProductId INT IDENTITY(1,1) PRIMARY KEY,
    Sku VARCHAR(20) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    CategoryId INT NOT NULL FOREIGN KEY REFERENCES Categories(CategoryId),
    SupplierId INT NOT NULL FOREIGN KEY REFERENCES Suppliers(SupplierId),
    UnitPrice DECIMAL(10,2) NOT NULL CHECK (UnitPrice >= 0),
    QtyInStock INT NOT NULL DEFAULT 0 CHECK (QtyInStock >= 0),
    ReorderLevel INT NOT NULL DEFAULT 10
);
GO
CREATE TABLE StockMovements (
    MovementId INT IDENTITY(1,1) PRIMARY KEY,
    ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(ProductId),
    MovementType VARCHAR(3) NOT NULL CHECK (MovementType IN ('IN', 'OUT')),
    Quantity INT NOT NULL CHECK (Quantity > 0),
    MovementDate DATE NOT NULL
);
GO
INSERT INTO Categories (Name) VALUES ('Electronics'), ('Stationery');
INSERT INTO Suppliers (Name, Phone) VALUES ('TechSource Pvt Ltd', '9820012345'), ('PaperWorld', '9890054321');
INSERT INTO Products (Sku, Name, CategoryId, SupplierId, UnitPrice, QtyInStock, ReorderLevel) VALUES
('EL-MOUSE', 'Wireless Mouse', 1, 1, 650, 40, 15),
('EL-KEYB', 'USB Keyboard', 1, 1, 900, 12, 15),
('ST-PEN', 'Gel Pen (Box of 10)', 2, 2, 120, 200, 50),
('ST-NOTE', 'A4 Notebook', 2, 2, 85, 30, 40);
GO
BEGIN TRAN;
INSERT INTO StockMovements (ProductId, MovementType, Quantity, MovementDate) VALUES (1, 'OUT', 25, '2026-11-10');
UPDATE Products SET QtyInStock = QtyInStock - 25 WHERE ProductId = 1;
COMMIT;
GO
BEGIN TRAN;
INSERT INTO StockMovements (ProductId, MovementType, Quantity, MovementDate) VALUES (2, 'OUT', 50, '2026-11-11');
UPDATE Products SET QtyInStock = QtyInStock - 50 WHERE ProductId = 2;
ROLLBACK;
GO
SELECT p.Sku, p.Name, c.Name AS Category, p.QtyInStock, p.ReorderLevel,
       CASE WHEN p.QtyInStock < p.ReorderLevel THEN 'REORDER' ELSE 'OK' END AS StockStatus,
       p.QtyInStock * p.UnitPrice AS StockValue
FROM Products p
JOIN Categories c ON c.CategoryId = p.CategoryId
ORDER BY p.Sku;
GO
SELECT c.Name AS Category, SUM(p.QtyInStock * p.UnitPrice) AS TotalStockValue
FROM Products p
JOIN Categories c ON c.CategoryId = p.CategoryId
GROUP BY c.Name
ORDER BY TotalStockValue DESC;
GO
SELECT COUNT(*) AS Movements FROM StockMovements;`;

const ecomSql = `CREATE DATABASE ShopDB;
GO
USE ShopDB;
GO
CREATE TABLE Customers (
    CustomerId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    City NVARCHAR(50) NOT NULL
);
GO
CREATE TABLE Products (
    ProductId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Price DECIMAL(10,2) NOT NULL CHECK (Price > 0),
    Stock INT NOT NULL CHECK (Stock >= 0)
);
GO
CREATE TABLE Orders (
    OrderId INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId INT NOT NULL FOREIGN KEY REFERENCES Customers(CustomerId),
    OrderDate DATE NOT NULL,
    Status VARCHAR(12) NOT NULL DEFAULT 'Placed' CHECK (Status IN ('Placed', 'Shipped', 'Delivered', 'Cancelled'))
);
GO
CREATE TABLE OrderItems (
    OrderItemId INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT NOT NULL FOREIGN KEY REFERENCES Orders(OrderId),
    ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(ProductId),
    Quantity INT NOT NULL CHECK (Quantity > 0),
    UnitPrice DECIMAL(10,2) NOT NULL
);
GO
INSERT INTO Customers (FullName, Email, City) VALUES
('Ishaan Gupta', 'ishaan@mail.com', 'Pune'),
('Meera Nair', 'meera@mail.com', 'Kochi'),
('Farhan Shaikh', 'farhan@mail.com', 'Mumbai');
INSERT INTO Products (Name, Price, Stock) VALUES
('Bluetooth Speaker', 2500, 30),
('Phone Cover', 300, 150),
('Power Bank', 1500, 60);
INSERT INTO Orders (CustomerId, OrderDate, Status) VALUES
(1, '2026-11-01', 'Delivered'),
(2, '2026-11-05', 'Shipped'),
(1, '2026-11-12', 'Placed'),
(3, '2026-11-13', 'Cancelled');
INSERT INTO OrderItems (OrderId, ProductId, Quantity, UnitPrice) VALUES
(1, 1, 1, 2500), (1, 2, 2, 300),
(2, 3, 2, 1500),
(3, 2, 3, 300), (3, 3, 1, 1500),
(4, 1, 2, 2500);
GO
SELECT o.OrderId, c.FullName, o.Status,
       SUM(i.Quantity * i.UnitPrice) AS OrderTotal
FROM Orders o
JOIN Customers c ON c.CustomerId = o.CustomerId
JOIN OrderItems i ON i.OrderId = o.OrderId
GROUP BY o.OrderId, c.FullName, o.Status
ORDER BY o.OrderId;
GO
SELECT TOP 2 p.Name, SUM(i.Quantity) AS UnitsSold,
       SUM(i.Quantity * i.UnitPrice) AS Revenue
FROM OrderItems i
JOIN Products p ON p.ProductId = i.ProductId
JOIN Orders o ON o.OrderId = i.OrderId
WHERE o.Status <> 'Cancelled'
GROUP BY p.Name
ORDER BY Revenue DESC;
GO
SELECT c.FullName, COUNT(o.OrderId) AS Orders
FROM Customers c
LEFT JOIN Orders o ON o.CustomerId = c.CustomerId AND o.Status <> 'Cancelled'
GROUP BY c.FullName
ORDER BY Orders DESC, c.FullName;`;

const hospSql = `CREATE DATABASE HospitalDB;
GO
USE HospitalDB;
GO
CREATE TABLE Doctors (
    DoctorId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Specialization NVARCHAR(50) NOT NULL,
    ConsultationFee DECIMAL(8,2) NOT NULL CHECK (ConsultationFee > 0)
);
GO
CREATE TABLE Patients (
    PatientId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Gender CHAR(1) NOT NULL CHECK (Gender IN ('M', 'F', 'O')),
    DateOfBirth DATE NOT NULL,
    Phone VARCHAR(15) NOT NULL UNIQUE
);
GO
CREATE TABLE Appointments (
    AppointmentId INT IDENTITY(1,1) PRIMARY KEY,
    DoctorId INT NOT NULL FOREIGN KEY REFERENCES Doctors(DoctorId),
    PatientId INT NOT NULL FOREIGN KEY REFERENCES Patients(PatientId),
    AppointmentDate DATE NOT NULL,
    SlotTime VARCHAR(5) NOT NULL,
    Status VARCHAR(10) NOT NULL DEFAULT 'Booked' CHECK (Status IN ('Booked', 'Completed', 'Cancelled')),
    CONSTRAINT UQ_DoctorSlot UNIQUE (DoctorId, AppointmentDate, SlotTime)
);
GO
CREATE TABLE Bills (
    BillId INT IDENTITY(1,1) PRIMARY KEY,
    AppointmentId INT NOT NULL UNIQUE FOREIGN KEY REFERENCES Appointments(AppointmentId),
    Amount DECIMAL(10,2) NOT NULL,
    IsPaid BIT NOT NULL DEFAULT 0
);
GO
INSERT INTO Doctors (FullName, Specialization, ConsultationFee) VALUES
('Dr. Asha Menon', 'Cardiology', 800),
('Dr. Rajesh Kumar', 'Orthopedics', 600);
INSERT INTO Patients (FullName, Gender, DateOfBirth, Phone) VALUES
('Suresh Pawar', 'M', '1965-03-12', '9811111111'),
('Lata Shinde', 'F', '1990-08-25', '9822222222'),
('Omkar Jadhav', 'M', '2012-01-30', '9833333333');
INSERT INTO Appointments (DoctorId, PatientId, AppointmentDate, SlotTime, Status) VALUES
(1, 1, '2026-11-18', '10:00', 'Completed'),
(1, 2, '2026-11-18', '10:30', 'Booked'),
(2, 3, '2026-11-18', '11:00', 'Completed');
GO
INSERT INTO Appointments (DoctorId, PatientId, AppointmentDate, SlotTime) VALUES (1, 3, '2026-11-18', '10:30');
GO
INSERT INTO Bills (AppointmentId, Amount, IsPaid) VALUES (1, 800, 1), (3, 600, 0);
GO
SELECT a.SlotTime, d.FullName AS Doctor, p.FullName AS Patient,
       DATEDIFF(YEAR, p.DateOfBirth, a.AppointmentDate) AS ApproxAge, a.Status
FROM Appointments a
JOIN Doctors d ON d.DoctorId = a.DoctorId
JOIN Patients p ON p.PatientId = a.PatientId
WHERE a.AppointmentDate = '2026-11-18'
ORDER BY a.SlotTime;
GO
SELECT d.FullName AS Doctor, COUNT(b.BillId) AS BilledVisits,
       ISNULL(SUM(b.Amount), 0) AS Billed,
       ISNULL(SUM(CASE WHEN b.IsPaid = 1 THEN b.Amount ELSE 0 END), 0) AS Collected
FROM Doctors d
LEFT JOIN Appointments a ON a.DoctorId = d.DoctorId
LEFT JOIN Bills b ON b.AppointmentId = a.AppointmentId
GROUP BY d.FullName
ORDER BY d.FullName;`;

const productCs = `using System;

public class Product
{
    public string Sku { get; }
    public string Name { get; }
    public int Quantity { get; private set; }     // only StockService can change it through Add/Remove
    public int ReorderLevel { get; }

    public Product(string sku, string name, int quantity, int reorderLevel)
    {
        Sku = sku;
        Name = name;
        Quantity = quantity;
        ReorderLevel = reorderLevel;
    }

    public void Add(int qty) => Quantity += qty;
    public void Remove(int qty) => Quantity -= qty;
}

public class InsufficientStockException : Exception
{
    public InsufficientStockException(string sku, int requested, int available)
        : base($"Insufficient stock for {sku}: requested {requested}, available {available}") { }
}
`;

const stockServiceCs = `using System;
using System.Collections.Generic;
using System.Linq;

public class StockService
{
    private readonly List<Product> _products = new();

    public void AddProduct(Product p) => _products.Add(p);

    private Product Find(string sku) =>
        _products.FirstOrDefault(p => p.Sku == sku) ?? throw new KeyNotFoundException($"Unknown SKU {sku}");

    public int Receive(string sku, int qty)          // purchase / goods received (IN)
    {
        if (qty <= 0) throw new ArgumentException("Quantity must be greater than zero");
        var p = Find(sku);
        p.Add(qty);
        return p.Quantity;
    }

    public int Issue(string sku, int qty)            // sale / issue to department (OUT)
    {
        if (qty <= 0) throw new ArgumentException("Quantity must be greater than zero");
        var p = Find(sku);
        if (qty > p.Quantity) throw new InsufficientStockException(sku, qty, p.Quantity);
        p.Remove(qty);
        return p.Quantity;
    }

    public IEnumerable<Product> LowStock() => _products.Where(p => p.Quantity < p.ReorderLevel);
}
`;

const stockProgram = `using System;
using System.Collections.Generic;

var stock = new StockService();
stock.AddProduct(new Product("EL-MOUSE", "Wireless Mouse", 40, 15));
stock.AddProduct(new Product("EL-KEYB", "USB Keyboard", 12, 15));
stock.AddProduct(new Product("ST-NOTE", "A4 Notebook", 30, 40));

Run("OUT", "EL-MOUSE", 25);
Run("OUT", "EL-KEYB", 50);
Run("IN", "ST-NOTE", 20);
Run("OUT", "XX-000", 1);
Run("IN", "EL-MOUSE", -5);

Console.WriteLine("Low stock report:");
foreach (var p in stock.LowStock())
    Console.WriteLine($"  REORDER {p.Sku} {p.Name}: {p.Quantity} left (level {p.ReorderLevel})");

void Run(string type, string sku, int qty)
{
    try
    {
        int now = type == "IN" ? stock.Receive(sku, qty) : stock.Issue(sku, qty);
        Console.WriteLine($"{type,-4} {sku} x{qty} -> OK, stock now {now}");
    }
    catch (Exception ex) when (ex is InsufficientStockException || ex is ArgumentException || ex is KeyNotFoundException)
    {
        Console.WriteLine($"{type,-4} {sku} x{qty} -> FAILED: {ex.Message}");
    }
}
`;

const cartModelsCs = `public record CartItem(string Name, decimal Price, int Qty);

public record OrderSummary(decimal Subtotal, decimal Discount, string CouponNote,
                           decimal Gst, decimal Shipping, decimal Total);
`;

const checkoutServiceCs = `using System;
using System.Collections.Generic;
using System.Linq;

public class CheckoutService
{
    public const decimal GstRate = 0.18m;
    public const decimal FreeShippingAbove = 999m;
    public const decimal ShippingCharge = 49m;

    public OrderSummary Checkout(List<CartItem> cart, string? coupon)
    {
        if (cart.Count == 0) throw new InvalidOperationException("Cart is empty");
        if (cart.Any(i => i.Qty <= 0)) throw new InvalidOperationException("Quantity must be at least 1");

        decimal subtotal = cart.Sum(i => i.Price * i.Qty);
        (decimal discount, string note) = ApplyCoupon(subtotal, coupon);
        decimal afterDiscount = subtotal - discount;
        decimal gst = Math.Round(afterDiscount * GstRate, 2);
        decimal shipping = afterDiscount >= FreeShippingAbove ? 0m : ShippingCharge;

        return new OrderSummary(subtotal, discount, note, gst, shipping, afterDiscount + gst + shipping);
    }

    private static (decimal Discount, string Note) ApplyCoupon(decimal subtotal, string? coupon)
    {
        switch (coupon)
        {
            case null or "":
                return (0m, "no coupon");
            case "SAVE10":
            {
                decimal d = subtotal * 0.10m;                       // 10% off, maximum 500
                return d > 500m ? (500m, "SAVE10, capped at 500") : (d, "SAVE10");
            }
            case "FLAT200":
                return subtotal >= 1500m ? (200m, "FLAT200") : (0m, "FLAT200 needs subtotal 1500");
            default:
                return (0m, coupon + " is invalid");
        }
    }
}
`;

const checkoutProgram = `using System;
using System.Collections.Generic;
using System.Globalization;

var checkout = new CheckoutService();

var orders = new List<(List<CartItem> Cart, string? Coupon)>
{
    (new List<CartItem> { new CartItem("Bluetooth Speaker", 2500m, 1), new CartItem("Phone Cover", 300m, 2) }, "SAVE10"),
    (new List<CartItem> { new CartItem("Phone Cover", 300m, 2) }, "FLAT200"),
    (new List<CartItem>(), null),
    (new List<CartItem> { new CartItem("Power Bank", 1500m, 4) }, "SAVE10"),
    (new List<CartItem> { new CartItem("Power Bank", 1500m, 1) }, "BIGSALE"),
};

int no = 0;
foreach (var (cart, coupon) in orders)
{
    no++;
    try
    {
        var s = checkout.Checkout(cart, coupon);
        Console.WriteLine($"Order {no}: Subtotal {M(s.Subtotal)} | Discount {M(s.Discount)} ({s.CouponNote}) | GST {M(s.Gst)} | Shipping {M(s.Shipping)} | Total {M(s.Total)}");
    }
    catch (InvalidOperationException ex)
    {
        Console.WriteLine($"Order {no}: ERROR {ex.Message}");
    }
}

static string M(decimal v) => v.ToString("0.00", CultureInfo.InvariantCulture);
`;

const hospitalModelsCs = `using System;

public record Doctor(int Id, string Name, decimal Fee, string[] Slots);

public record Patient(int Id, string Name, int Age);

public class Appointment
{
    public int Id { get; init; }
    public Doctor Doctor { get; init; } = null!;
    public Patient Patient { get; init; } = null!;
    public DateOnly Date { get; init; }
    public string Slot { get; init; } = "";
    public decimal Fee { get; init; }
    public string Status { get; set; } = "Booked";
}
`;

const appointmentServiceCs = `using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

public class AppointmentService
{
    public const int SeniorAge = 60;
    public const decimal SeniorDiscount = 0.20m;

    private readonly DateOnly _today;              // injected so the rules are testable (no DateTime.Now)
    private readonly List<Doctor> _doctors = new();
    private readonly List<Appointment> _appointments = new();
    private int _nextId = 1;

    public AppointmentService(DateOnly today) => _today = today;

    public void AddDoctor(Doctor d) => _doctors.Add(d);

    public string Book(int doctorId, Patient patient, DateOnly date, string slot)
    {
        if (date < _today) return "Rejected: cannot book a past date";

        var doctor = _doctors.FirstOrDefault(d => d.Id == doctorId);
        if (doctor is null) return $"Rejected: doctor {doctorId} not found";
        if (!doctor.Slots.Contains(slot)) return $"Rejected: {doctor.Name} has no {slot} slot";

        var active = _appointments.Where(a => a.Status == "Booked" && a.Date == date && a.Slot == slot).ToList();
        if (active.Any(a => a.Doctor.Id == doctorId))
            return $"Rejected: {doctor.Name} is already booked at {slot}";
        if (active.Any(a => a.Patient.Id == patient.Id))
            return $"Rejected: {patient.Name} already has an appointment at {slot}";

        bool senior = patient.Age >= SeniorAge;
        decimal fee = senior ? doctor.Fee * (1 - SeniorDiscount) : doctor.Fee;
        var appt = new Appointment { Id = _nextId++, Doctor = doctor, Patient = patient, Date = date, Slot = slot, Fee = fee };
        _appointments.Add(appt);

        string note = senior ? " (senior 20% off)" : "";
        return $"Booked #{appt.Id}: {patient.Name} with {doctor.Name} at {slot}, fee {fee.ToString("0.00", CultureInfo.InvariantCulture)}{note}";
    }

    public string Cancel(int appointmentId)
    {
        var a = _appointments.FirstOrDefault(x => x.Id == appointmentId && x.Status == "Booked");
        if (a is null) return $"Cancel failed: no active appointment #{appointmentId}";
        a.Status = "Cancelled";
        return $"Cancelled #{a.Id}, slot {a.Slot} is free again";
    }

    public IEnumerable<string> FreeSlots(int doctorId, DateOnly date)
    {
        var doctor = _doctors.First(d => d.Id == doctorId);
        return doctor.Slots.Where(s => !_appointments.Any(a =>
            a.Doctor.Id == doctorId && a.Date == date && a.Slot == s && a.Status == "Booked"));
    }
}
`;

const hospitalProgram = `using System;

var today = new DateOnly(2026, 11, 18);
var hospital = new AppointmentService(today);
hospital.AddDoctor(new Doctor(1, "Dr. Asha Menon", 800m, new[] { "10:00", "10:30", "11:00" }));
hospital.AddDoctor(new Doctor(2, "Dr. Rajesh Kumar", 600m, new[] { "10:30", "11:00", "11:30" }));

var suresh = new Patient(1, "Suresh Pawar", 61);
var lata = new Patient(2, "Lata Shinde", 36);
var omkar = new Patient(3, "Omkar Jadhav", 14);

Console.WriteLine(hospital.Book(1, suresh, today, "10:00"));
Console.WriteLine(hospital.Book(1, lata, today, "10:00"));
Console.WriteLine(hospital.Book(1, lata, today, "10:30"));
Console.WriteLine(hospital.Book(2, lata, today, "10:30"));
Console.WriteLine(hospital.Book(2, omkar, today.AddDays(-1), "11:00"));
Console.WriteLine(hospital.Book(2, omkar, today, "12:00"));
Console.WriteLine(hospital.Cancel(1));
Console.WriteLine(hospital.Book(1, omkar, today, "10:00"));
Console.WriteLine("Free slots for Dr. Asha Menon today: " + string.Join(", ", hospital.FreeSlots(1, today)));
`;

export default {
  id: 'day-120-inventory-ecommerce-hospital-projects-assessment',
  title: 'Final Projects Part 2: Inventory, E-Commerce and Hospital Management Systems, Course Assessment and Interview Preparation',
  module: 'Module 12: Final Real-Time Projects',
  day: 120,
  level: 'Advanced',
  duration: '4 hours',
  summary:
    'Three more industry projects - Inventory Management, E-Commerce and Hospital Management - each with features, schema, endpoints, React pages and a runnable business-rule class. Then the course assessment and exam pattern, the final-project evaluation rubric and 40 mixed interview questions covering C#, OOP, SQL Server, frontend, ASP.NET Core, EF Core, Web API, React, security, testing and deployment.',
  objectives: [
    'Design the database, API and UI for inventory, e-commerce and hospital systems',
    'Protect business rules (stock, pricing, appointments) with constraints, transactions and service classes',
    'Choose a final project and present it using the evaluation rubric',
    'Understand the course assessment and final exam pattern',
    'Revise the whole course with 40 mixed interview questions',
  ],
  theory: [
    {
      heading: 'Project 3: Inventory Management System',
      content:
        'Problem: a shop or warehouse does not know exact stock levels, runs out of fast-moving items and over-buys slow ones. The system records every stock movement (purchase IN, sale/issue OUT, adjustment) and keeps the current quantity correct using transactions. Tables: Categories, Suppliers, Products (Sku unique, UnitPrice, QtyInStock CHECK >= 0, ReorderLevel), StockMovements (ProductId, MovementType IN/OUT, Quantity > 0, MovementDate), PurchaseOrders + PurchaseOrderItems (optional).',
      points: [
        'Features: product/category/supplier CRUD, barcode/SKU search, stock IN/OUT, low-stock alerts, purchase orders, stock valuation report, movement history, CSV/Excel export, product image upload',
        'Rules: stock never negative (CHECK + service check), every change writes a StockMovements row in the SAME transaction, reorder alert when QtyInStock < ReorderLevel',
        'API: GET/POST/PUT/DELETE /api/products, POST /api/stock/in, POST /api/stock/out (409 if insufficient), GET /api/reports/low-stock, GET /api/reports/stock-value',
        'React pages: Dashboard (stock value, low-stock count), Products (table + filters), Product form, Stock In/Out form, Movement history, Reports',
        'Concurrency: add a rowversion column ([Timestamp]) so two clerks cannot both sell the last item',
      ],
    },
    {
      heading: 'Project 4: E-Commerce System',
      content:
        'Problem: a small business wants to sell online. Customers browse products, add to a cart, place orders and track them; admins manage the catalog and order status. Tables: Customers (or Identity users), Categories, Products (Price, Stock), Carts/CartItems, Orders (Status Placed/Shipped/Delivered/Cancelled), OrderItems (UnitPrice copied at order time), Payments, Coupons, Addresses.',
      points: [
        'Customer features: register/login, product list with search, filter, sort and paging, product details, cart, checkout with coupon, order history, cancel before shipping',
        'Admin features: product CRUD with image upload, categories, order management, sales dashboard (revenue, top products)',
        'Rules: price is read from the database, never trusted from React; OrderItems store UnitPrice at purchase time; stock is reduced and the order is saved in one transaction; GST and shipping calculated on the server',
        'API: GET /api/products?search=&categoryId=&sort=price_desc&page=, GET /api/cart, POST /api/cart/items, POST /api/orders (checkout), GET /api/orders/my, PUT /api/orders/{id}/status (Admin), POST /api/payments/webhook',
        'React pages: Home/Catalog, ProductDetails, Cart, Checkout, MyOrders, OrderDetails, Admin (Products, Orders, Dashboard); CartContext with useReducer',
      ],
    },
    {
      heading: 'Project 5: Hospital Management System',
      content:
        'Problem: a clinic manages appointments on paper, doctors get double-booked and bills are lost. Tables: Doctors (Specialization, ConsultationFee), DoctorSchedules (day, slots), Patients (DateOfBirth, Phone unique), Appointments (DoctorId + Date + Slot UNIQUE, Status Booked/Completed/Cancelled), Prescriptions/MedicalRecords, Bills (one per appointment, IsPaid).',
      points: [
        'Roles: Admin (doctors, schedules), Receptionist (register patients, book appointments, billing), Doctor (today\'s appointments, prescriptions), Patient (book online, view history)',
        'Rules: no double booking (unique constraint + service check), no booking in the past, patient cannot be in two places at the same time, senior-citizen discount on consultation fee, cancellation frees the slot',
        'API: GET /api/doctors?specialization=, GET /api/doctors/{id}/slots?date=, POST /api/appointments (409 if slot taken), PUT /api/appointments/{id}/cancel, PUT /api/appointments/{id}/complete (Doctor), POST /api/bills, GET /api/patients/{id}/history',
        'React pages: Doctor list, Slot picker (calendar), Appointment form, Receptionist dashboard, Doctor\'s day view, Patient history, Billing',
        'Sensitive data: medical records require strict role checks, HTTPS, audit logging and never logging personal data',
      ],
    },
    {
      heading: 'Choosing, building and presenting your final project',
      content:
        'Pick ONE project (from Day 119 or today) as your main portfolio project and build it completely using the 10-step plan from Day 119. A smaller second project shows range. During the final evaluation you demo the running app, explain the architecture and answer viva questions on your own code.',
      points: [
        'Minimum scope: login with roles, at least 4 related tables, full CRUD for 2 entities, search + paging, one business rule with unit tests, one report/dashboard, global error handling, deployed or Dockerized',
        'Rubric (100): Requirements and design 10, Database design 15, Web API quality 20, React UI/UX 15, Security 10, Testing 10, Code quality and Git history 10, Deployment and documentation 5, Presentation and viva 5',
        'Submission: GitHub repo link, README (features, tech stack, setup, screenshots, test users), database script or migrations, Postman collection, 5-minute demo video',
        'Common mistakes: secrets in appsettings.json pushed to GitHub, no validation on the server, prices trusted from the client, one giant controller, no loading/error states in React',
      ],
    },
    {
      heading: 'Course assessment and exam pattern',
      content:
        'Your final grade combines continuous assessment during the 120 days with a final exam and the project evaluation. Passing requires 50% overall and at least 40% in each component.',
      syntax: `Component                                   Weight
Module tests (12 online MCQ + short-code tests)  20%
Weekly assignments / practical tasks             15%
Final theory exam (objective)                    10%
Final practical exam                             20%
Final project (build + demo + viva)              30%
Mock interview and communication                  5%

Final theory exam: 40 MCQs x 1 mark, 45 minutes, no negative marking
  C# & OOP 10 | SQL Server 6 | HTML/CSS/JS 4 | ASP.NET Core & EF Core 8 | Web API & Security 6 | React 4 | Testing, Git, Deployment 2

Final practical exam: 3 hours, 100 marks
  Q1 C# console program with OOP + collections + exception handling   20
  Q2 SQL Server: create tables with constraints + 4 queries (joins, group by, subquery)  20
  Q3 ASP.NET Core Web API: CRUD endpoints with EF Core, DTO validation, status codes   30
  Q4 React: list + form page calling the API with axios, loading/error states          20
  Q5 Viva on the code you wrote                                                          10

Grades: A+ >= 90, A >= 75, B >= 60, C >= 50, below 50 = re-attempt`,
      tip: 'Practise the practical exam under time pressure: build a tiny CRUD (one table, API, React list + form) from an empty folder in 90 minutes. Repeat until it feels routine.',
    },
    {
      heading: 'How to prepare for .NET full-stack interviews',
      content:
        'Interviews usually have four rounds: an online test (MCQ + coding), a technical round on C#/OOP/SQL, a project and framework round (ASP.NET Core, EF Core, Web API, React) and an HR round. Revise the definitions, but more importantly be able to show code and explain WHY.',
      points: [
        'Prepare a 2-minute introduction and a 3-minute project walkthrough (problem, architecture, your role, challenges, what you would improve)',
        'Know output-based C# questions: value vs reference types, string immutability, static, virtual/override vs new, exceptions and finally',
        'Write SQL on paper: second-highest salary, department-wise counts, duplicates, joins, nth row with OFFSET/FETCH or ROW_NUMBER',
        'Be ready to draw the request pipeline: Kestrel -> middleware (exception, HTTPS, routing, CORS, auth) -> controller -> service -> EF Core -> SQL Server',
        'Use the STAR method (Situation, Task, Action, Result) for "tell me about a bug you fixed" questions',
      ],
    },
  ],
  examples: [
    {
      title: 'Inventory - schema, stock transaction and low-stock report',
      scenario:
        'Create InventoryDB, sell 25 mice inside a transaction (committed), try to sell 50 keyboards when only 12 are in stock (CHECK fails, transaction rolled back), then show the stock report with reorder status and value per category.',
      steps: [
        'Open SSMS (or the in-app SSMS Lab) and click New Query (Ctrl+N)',
        'Paste the script and press F5',
        'Read the Messages tab: the second UPDATE fails with Msg 547 (CHECK constraint)',
        'Read the Results tab: EL-MOUSE shows 15, EL-KEYB still shows 12 and StockMovements has only 1 row',
      ],
      code: invSql,
      tsql: invSql,
      result: `>> CREATE DATABASE InventoryDB -> Commands completed successfully.
>> USE InventoryDB -> Commands completed successfully.
>> CREATE TABLE Categories ( -> Commands completed successfully.
>> CREATE TABLE Suppliers ( -> Commands completed successfully.
>> CREATE TABLE Products ( -> Commands completed successfully.
>> CREATE TABLE StockMovements ( -> Commands completed successfully.
>> INSERT INTO Categories (Name) VALUES ('Electronics'), ('Stationery') -> (2 rows affected)
>> INSERT INTO Suppliers (Name, Phone) VALUES ('TechSource Pvt Ltd', '982 -> (2 rows affected)
>> INSERT INTO Products (Sku, Name, CategoryId, SupplierId, UnitPrice, Qt -> (4 rows affected)
>> BEGIN TRAN -> Commands completed successfully.
>> INSERT INTO StockMovements (ProductId, MovementType, Quantity, Movemen -> (1 row affected)
>> UPDATE Products SET QtyInStock = QtyInStock - 25 WHERE ProductId = 1 -> (1 row affected)
>> COMMIT -> Commands completed successfully.
>> BEGIN TRAN -> Commands completed successfully.
>> INSERT INTO StockMovements (ProductId, MovementType, Quantity, Movemen -> (1 row affected)
>> UPDATE Products SET QtyInStock = QtyInStock - 50 WHERE ProductId = 2 -> ERROR: Msg 547, Level 16, State 0, Line 1
The statement conflicted with the CHECK constraint.
>> ROLLBACK -> Commands completed successfully.
>> SELECT p.Sku, p.Name, c.Name AS Category, p.QtyInStock, p.ReorderLevel
+----------+---------------------+-------------+------------+--------------+-------------+------------+
| Sku      | Name                | Category    | QtyInStock | ReorderLevel | StockStatus | StockValue |
+----------+---------------------+-------------+------------+--------------+-------------+------------+
| EL-KEYB  | USB Keyboard        | Electronics | 12         | 15           | REORDER     | 10800      |
| EL-MOUSE | Wireless Mouse      | Electronics | 15         | 15           | OK          | 9750       |
| ST-NOTE  | A4 Notebook         | Stationery  | 30         | 40           | REORDER     | 2550       |
| ST-PEN   | Gel Pen (Box of 10) | Stationery  | 200        | 50           | OK          | 24000      |
+----------+---------------------+-------------+------------+--------------+-------------+------------+
4 row(s) returned
>> SELECT c.Name AS Category, SUM(p.QtyInStock * p.UnitPrice) AS TotalSto
+-------------+-----------------+
| Category    | TotalStockValue |
+-------------+-----------------+
| Stationery  | 26550           |
| Electronics | 20550           |
+-------------+-----------------+
2 row(s) returned
>> SELECT COUNT(*) AS Movements FROM StockMovements
+-----------+
| Movements |
+-----------+
| 1         |
+-----------+
1 row(s) returned`,
      explanation:
        'The first transaction inserts the movement and reduces stock, then COMMIT makes both permanent. In the second, the INSERT succeeds but the UPDATE would make QtyInStock -38, which violates CHECK (QtyInStock >= 0); ROLLBACK then undoes the inserted movement too, so StockMovements has just 1 row and the keyboard stock is unchanged - the "all or nothing" guarantee. In the application this is done with BeginTransactionAsync in EF Core (Day 85) and the service returns 409 Conflict. EL-MOUSE has 15 left which equals its level, so it is OK (rule is "less than"). Real SQL Server shows StockValue as 10800.00; the lab drops trailing zeros. In real SQL Server the full error text names the constraint, e.g. CK__Products__QtyIn__...',
    },
    {
      title: 'Inventory stock rules with a custom exception (console)',
      scenario:
        'Implement StockService with Receive (IN) and Issue (OUT): reject zero/negative quantities, unknown SKUs and issues larger than the available stock (custom InsufficientStockException), and produce a low-stock report.',
      steps: [
        'In Visual Studio: File > New > Project > Console App, name it InventoryRules',
        'Add Product.cs and StockService.cs (Project > Add Class, Shift+Alt+C)',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `// ===== Product.cs =====
${productCs}
// ===== StockService.cs =====
${stockServiceCs}
// ===== Program.cs =====
${stockProgram}`,
      csharp: { files: { 'Program.cs': stockProgram, 'Product.cs': productCs, 'StockService.cs': stockServiceCs }, stdin: '' },
      result: `OUT  EL-MOUSE x25 -> OK, stock now 15
OUT  EL-KEYB x50 -> FAILED: Insufficient stock for EL-KEYB: requested 50, available 12
IN   ST-NOTE x20 -> OK, stock now 50
OUT  XX-000 x1 -> FAILED: Unknown SKU XX-000
IN   EL-MOUSE x-5 -> FAILED: Quantity must be greater than zero
Low stock report:
  REORDER EL-KEYB USB Keyboard: 12 left (level 15)`,
      explanation:
        '{type,-4} left-aligns the type in 4 characters, so "OUT" and "IN" line up. Quantity has a private setter: code outside Product cannot set it directly, only through Add/Remove called by the service (encapsulation). The exception filter (catch ... when) handles only the expected business errors; anything else would still crash and be logged. After the operations: mouse 15 (not < 15), keyboard 12 (< 15 -> reorder), notebook 50 (not < 40), so only the keyboard is reported. In the Web API, the controller maps InsufficientStockException to 409 Conflict and KeyNotFoundException to 404.',
    },
    {
      title: 'E-Commerce - orders schema and sales reports',
      scenario:
        'Create ShopDB with Customers, Products, Orders and OrderItems. Calculate each order total, the top 2 products by revenue (excluding cancelled orders) and the number of valid orders per customer.',
      steps: [
        'In SSMS: New Query (Ctrl+N), paste the script',
        'Press F5',
        'Compare order 4 (Cancelled) in the first grid with the second and third grids, where it is excluded',
      ],
      code: ecomSql,
      tsql: ecomSql,
      result: `>> CREATE DATABASE ShopDB -> Commands completed successfully.
>> USE ShopDB -> Commands completed successfully.
>> CREATE TABLE Customers ( -> Commands completed successfully.
>> CREATE TABLE Products ( -> Commands completed successfully.
>> CREATE TABLE Orders ( -> Commands completed successfully.
>> CREATE TABLE OrderItems ( -> Commands completed successfully.
>> INSERT INTO Customers (FullName, Email, City) VALUES -> (3 rows affected)
>> INSERT INTO Products (Name, Price, Stock) VALUES -> (3 rows affected)
>> INSERT INTO Orders (CustomerId, OrderDate, Status) VALUES -> (4 rows affected)
>> INSERT INTO OrderItems (OrderId, ProductId, Quantity, UnitPrice) VALUE -> (6 rows affected)
>> SELECT o.OrderId, c.FullName, o.Status,
+---------+---------------+-----------+------------+
| OrderId | FullName      | Status    | OrderTotal |
+---------+---------------+-----------+------------+
| 1       | Ishaan Gupta  | Delivered | 3100       |
| 2       | Meera Nair    | Shipped   | 3000       |
| 3       | Ishaan Gupta  | Placed    | 2400       |
| 4       | Farhan Shaikh | Cancelled | 5000       |
+---------+---------------+-----------+------------+
4 row(s) returned
>> SELECT TOP 2 p.Name, SUM(i.Quantity) AS UnitsSold,
+-------------------+-----------+---------+
| Name              | UnitsSold | Revenue |
+-------------------+-----------+---------+
| Power Bank        | 3         | 4500    |
| Bluetooth Speaker | 1         | 2500    |
+-------------------+-----------+---------+
2 row(s) returned
>> SELECT c.FullName, COUNT(o.OrderId) AS Orders
+---------------+--------+
| FullName      | Orders |
+---------------+--------+
| Ishaan Gupta  | 2      |
| Meera Nair    | 1      |
| Farhan Shaikh | 0      |
+---------------+--------+
3 row(s) returned`,
      explanation:
        'OrderItems stores UnitPrice at the time of purchase, so changing a product price later does not change old invoices. Order total = SUM(Quantity * UnitPrice) per order. The top-products query filters Status <> \'Cancelled\' in WHERE, so the cancelled speaker order is not counted: Power Bank 2 + 1 = 3 units = 4500. In the customer query the Cancelled filter is inside the LEFT JOIN ON clause - putting it in WHERE would remove Farhan completely instead of showing 0 orders. Real SQL Server prints the money columns as 3100.00 etc.',
    },
    {
      title: 'E-Commerce checkout pricing rules (console)',
      scenario:
        'Server-side checkout: subtotal from the cart, coupon rules (SAVE10 = 10% capped at 500, FLAT200 needs subtotal 1500), GST 18% on the discounted amount, shipping 49 below 999, and errors for an empty cart.',
      steps: [
        'In Visual Studio: File > New > Project > Console App, name it CheckoutRules',
        'Add Models.cs and CheckoutService.cs',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `// ===== Models.cs =====
${cartModelsCs}
// ===== CheckoutService.cs =====
${checkoutServiceCs}
// ===== Program.cs =====
${checkoutProgram}`,
      csharp: { files: { 'Program.cs': checkoutProgram, 'Models.cs': cartModelsCs, 'CheckoutService.cs': checkoutServiceCs }, stdin: '' },
      result: `Order 1: Subtotal 3100.00 | Discount 310.00 (SAVE10) | GST 502.20 | Shipping 0.00 | Total 3292.20
Order 2: Subtotal 600.00 | Discount 0.00 (FLAT200 needs subtotal 1500) | GST 108.00 | Shipping 49.00 | Total 757.00
Order 3: ERROR Cart is empty
Order 4: Subtotal 6000.00 | Discount 500.00 (SAVE10, capped at 500) | GST 990.00 | Shipping 0.00 | Total 6490.00
Order 5: Subtotal 1500.00 | Discount 0.00 (BIGSALE is invalid) | GST 270.00 | Shipping 0.00 | Total 1770.00`,
      explanation:
        'Order 1: 2500 + 2 x 300 = 3100; 10% = 310; 2790 x 18% = 502.20; 2790 >= 999 so free shipping; total 3292.20. Order 2: 600 is below 1500 so FLAT200 gives nothing; GST 108; shipping 49; total 757. Order 3 throws InvalidOperationException, which the loop catches. Order 4: 10% of 6000 = 600, capped at 500. Order 5: unknown coupon is reported but the order still prices correctly. All money is decimal, GST is rounded to 2 places with Math.Round, and output uses InvariantCulture. In the real API, CartItem prices are loaded from the Products table - never from the JSON React sends.',
    },
    {
      title: 'Hospital - appointments schema with double-booking protection',
      scenario:
        'Create HospitalDB with Doctors, Patients, Appointments (UNIQUE DoctorId + AppointmentDate + SlotTime) and Bills. Try to double-book a doctor, then list today\'s appointments and billing per doctor.',
      steps: [
        'In SSMS: New Query (Ctrl+N), paste the script',
        'Press F5',
        'The Messages tab shows the duplicate-key error for the second 10:30 booking; the batch continues after GO',
        'Read the two result grids',
      ],
      code: hospSql,
      tsql: hospSql,
      result: `>> CREATE DATABASE HospitalDB -> Commands completed successfully.
>> USE HospitalDB -> Commands completed successfully.
>> CREATE TABLE Doctors ( -> Commands completed successfully.
>> CREATE TABLE Patients ( -> Commands completed successfully.
>> CREATE TABLE Appointments ( -> Commands completed successfully.
>> CREATE TABLE Bills ( -> Commands completed successfully.
>> INSERT INTO Doctors (FullName, Specialization, ConsultationFee) VALUES -> (2 rows affected)
>> INSERT INTO Patients (FullName, Gender, DateOfBirth, Phone) VALUES -> (3 rows affected)
>> INSERT INTO Appointments (DoctorId, PatientId, AppointmentDate, SlotTi -> (3 rows affected)
>> INSERT INTO Appointments (DoctorId, PatientId, AppointmentDate, SlotTi -> ERROR: Msg 2627, Level 14, State 1, Line 1
Violation of PRIMARY KEY / UNIQUE KEY constraint. Cannot insert duplicate key. Appointments.DoctorId, Appointments.AppointmentDate, Appointments.SlotTime
>> INSERT INTO Bills (AppointmentId, Amount, IsPaid) VALUES (1, 800, 1),  -> (2 rows affected)
>> SELECT a.SlotTime, d.FullName AS Doctor, p.FullName AS Patient,
+----------+------------------+--------------+-----------+-----------+
| SlotTime | Doctor           | Patient      | ApproxAge | Status    |
+----------+------------------+--------------+-----------+-----------+
| 10:00    | Dr. Asha Menon   | Suresh Pawar | 61        | Completed |
| 10:30    | Dr. Asha Menon   | Lata Shinde  | 36        | Booked    |
| 11:00    | Dr. Rajesh Kumar | Omkar Jadhav | 14        | Completed |
+----------+------------------+--------------+-----------+-----------+
3 row(s) returned
>> SELECT d.FullName AS Doctor, COUNT(b.BillId) AS BilledVisits,
+------------------+--------------+--------+-----------+
| Doctor           | BilledVisits | Billed | Collected |
+------------------+--------------+--------+-----------+
| Dr. Asha Menon   | 1            | 800    | 800       |
| Dr. Rajesh Kumar | 1            | 600    | 0         |
+------------------+--------------+--------+-----------+
2 row(s) returned`,
      explanation:
        'UQ_DoctorSlot makes double booking impossible at database level: even if two receptionists click "Book" at the same moment, the second INSERT fails with error 2627 (the API catches DbUpdateException and returns 409 Conflict). Bills.AppointmentId is UNIQUE, enforcing one bill per appointment (a one-to-one relationship). DATEDIFF(YEAR, ...) counts year boundaries, so it is only an approximate age - for exact age compare month and day too. The second query uses LEFT JOINs and ISNULL so a doctor without bills still shows 0. Real SQL Server shows 800.00 instead of 800.',
    },
    {
      title: 'Hospital appointment booking rules (console)',
      scenario:
        'AppointmentService checks, in order: past date, doctor exists, slot exists in the doctor\'s schedule, doctor already booked, patient already busy at that time; applies a 20% senior-citizen discount; supports cancellation and lists free slots.',
      steps: [
        'In Visual Studio: File > New > Project > Console App, name it HospitalRules',
        'Add Models.cs and AppointmentService.cs',
        'Replace Program.cs with the code',
        'Press Ctrl+F5 (set a breakpoint with F9 on the first line of Book and press F5 to watch each rule with F10)',
      ],
      code: `// ===== Models.cs =====
${hospitalModelsCs}
// ===== AppointmentService.cs =====
${appointmentServiceCs}
// ===== Program.cs =====
${hospitalProgram}`,
      csharp: { files: { 'Program.cs': hospitalProgram, 'Models.cs': hospitalModelsCs, 'AppointmentService.cs': appointmentServiceCs }, stdin: '' },
      result: `Booked #1: Suresh Pawar with Dr. Asha Menon at 10:00, fee 640.00 (senior 20% off)
Rejected: Dr. Asha Menon is already booked at 10:00
Booked #2: Lata Shinde with Dr. Asha Menon at 10:30, fee 800.00
Rejected: Lata Shinde already has an appointment at 10:30
Rejected: cannot book a past date
Rejected: Dr. Rajesh Kumar has no 12:00 slot
Cancelled #1, slot 10:00 is free again
Booked #3: Omkar Jadhav with Dr. Asha Menon at 10:00, fee 800.00
Free slots for Dr. Asha Menon today: 11:00`,
      explanation:
        'Suresh is 61 (>= 60), so 800 x 0.80 = 640. Lata cannot take 10:00 because Dr. Asha is booked; she gets 10:30. Dr. Rajesh is free at 10:30, but Lata already has an appointment then, so the patient rule rejects it. Yesterday is before _today, and 12:00 is not in Dr. Rajesh\'s schedule. Cancelling #1 changes its status (the row is kept for history), so 10:00 becomes free and Omkar books it as #3. Only 11:00 remains free for Dr. Asha. "today" is passed into the constructor instead of calling DateTime.Now, so the output is always the same and unit tests can use any date.',
    },
  ],
  interview: [
    { q: 'What is the CLR and what does the JIT compiler do?', a: 'The Common Language Runtime executes .NET code: it loads assemblies, manages memory with the garbage collector, enforces type safety and handles exceptions. C# compiles to IL (Intermediate Language); at run time the JIT compiler converts IL into native machine code for the current CPU, method by method, the first time each method is called.', level: 'Easy' },
    { q: 'Difference between value types and reference types?', a: 'Value types (int, double, bool, struct, enum) hold their data directly; assigning copies the value. Reference types (class, string, array, delegate) hold a reference to an object on the managed heap; assigning copies the reference, so two variables can point to the same object. Value types cannot be null unless declared nullable (int?).', level: 'Easy' },
    { q: 'Output: string s = "abc"; string t = s; t += "d"; Console.WriteLine(s);', a: 'abc. Strings are immutable: t += "d" creates a new string "abcd" and points t at it; s still refers to "abc". Use StringBuilder when building strings in loops.', level: 'Medium' },
    { q: 'What is the difference between == and Equals() for strings and for objects?', a: 'For string, both compare content (string overloads ==). For a normal class, == compares references unless the operator is overloaded, and Equals() also compares references unless overridden. Records override Equals and == to compare values. If you override Equals you must also override GetHashCode.', level: 'Medium' },
    { q: 'Explain the four pillars of OOP with one example each.', a: 'Encapsulation: BankAccount keeps balance private and exposes Deposit/Withdraw. Abstraction: abstract class Payment with abstract Pay() hides how payment works. Inheritance: Employee : Person reuses Name and Age. Polymorphism: Payment p = new UpiPayment(); p.Pay() calls the overridden UPI version at run time.', level: 'Easy' },
    { q: 'Abstract class vs interface?', a: 'An abstract class can have fields, constructors, implemented and abstract members, and a class can inherit only one. An interface defines a contract (members are implicitly public; default implementations allowed since C# 8) with no instance fields or constructors, and a class can implement many. Use an abstract class for a shared base with common code ("is-a"), an interface for a capability ("can-do") such as INotification.', level: 'Medium' },
    { q: 'Output: class A { public virtual string Hi() => "A"; } class B : A { public override string Hi() => "B"; } class C : A { public new string Hi() => "C"; } A x = new B(); A y = new C(); Console.WriteLine(x.Hi() + y.Hi());', a: 'BA. B overrides the virtual method, so the runtime type decides and x.Hi() returns "B". C hides the method with new; through an A reference the A version runs, so y.Hi() returns "A".', level: 'Hard' },
    { q: 'What are generics and why use List<T> instead of ArrayList?', a: 'Generics let you write type-safe code with a type parameter (class Repository<T>). List<int> stores ints without boxing and the compiler checks types; ArrayList stores object, so value types are boxed and every read needs a cast that can fail at run time.', level: 'Easy' },
    { q: 'What happens in try/catch/finally when an exception is thrown and caught?', a: 'Execution jumps from the throw point to the first matching catch block (more specific catches must come first), then the finally block always runs - whether an exception occurred or not, even after return. finally is used to release resources; the using statement generates try/finally with Dispose().', level: 'Medium' },
    { q: 'First() vs FirstOrDefault() vs Single()?', a: 'First() returns the first element and throws if the sequence is empty. FirstOrDefault() returns default (null for reference types) if empty. Single() requires exactly one element and throws if there are zero or more than one; SingleOrDefault() throws only when more than one matches.', level: 'Medium' },
    { q: 'What is deferred execution in LINQ?', a: 'A LINQ query is not executed when it is defined, only when it is enumerated (foreach, ToList(), Count(), First()). Changing the source before enumeration changes the result. With EF Core this lets you build an IQueryable step by step and send ONE SQL query at ToListAsync().', level: 'Medium' },
    { q: 'Why use async/await in a Web API?', a: 'While the code awaits I/O (database, HTTP, files) the thread returns to the thread pool to serve other requests instead of blocking. This increases scalability, not the speed of a single request. Use async all the way (ToListAsync, SaveChangesAsync) and avoid .Result/.Wait(), which can block and deadlock.', level: 'Medium' },
    { q: 'DELETE vs TRUNCATE vs DROP?', a: 'DELETE removes rows (optionally with WHERE), is fully logged, fires triggers and keeps the identity seed. TRUNCATE removes all rows quickly with minimal logging, resets the identity and cannot be used on a table referenced by a foreign key. DROP removes the table structure itself. All three can be rolled back inside an explicit transaction in SQL Server.', level: 'Medium' },
    { q: 'WHERE vs HAVING?', a: 'WHERE filters individual rows before grouping and cannot use aggregate functions. HAVING filters groups after GROUP BY and can use aggregates, e.g. HAVING COUNT(*) > 5.', level: 'Easy' },
    { q: 'Write a query for the second-highest salary.', a: 'SELECT MAX(Salary) FROM Employees WHERE Salary < (SELECT MAX(Salary) FROM Employees); or with DENSE_RANK: SELECT Salary FROM (SELECT Salary, DENSE_RANK() OVER (ORDER BY Salary DESC) AS r FROM Employees) x WHERE r = 2; (DENSE_RANK handles duplicate salaries correctly).', level: 'Medium' },
    { q: 'INNER JOIN vs LEFT JOIN?', a: 'INNER JOIN returns only rows that match in both tables. LEFT JOIN returns all rows from the left table plus matching rows from the right; when there is no match the right columns are NULL. Use LEFT JOIN for "departments with zero employees" style reports.', level: 'Easy' },
    { q: 'What are ACID properties and how do transactions help?', a: 'Atomicity (all or nothing), Consistency (constraints remain valid), Isolation (concurrent transactions do not see each other\'s partial work), Durability (committed data survives crashes). BEGIN TRAN ... COMMIT/ROLLBACK groups statements, e.g. inserting a stock movement and updating stock together.', level: 'Medium' },
    { q: 'Clustered vs non-clustered index?', a: 'A clustered index defines the physical order of the table rows (one per table, usually the primary key). A non-clustered index is a separate structure with keys and pointers to the rows (many per table). Indexes speed up searches and joins but slow down inserts/updates and use space.', level: 'Medium' },
    { q: 'What is normalization? Explain 1NF, 2NF, 3NF briefly.', a: '1NF: atomic values, no repeating groups. 2NF: 1NF and every non-key column depends on the whole primary key (no partial dependency). 3NF: 2NF and no non-key column depends on another non-key column (no transitive dependency). It removes redundancy and update anomalies.', level: 'Medium' },
    { q: 'What is the difference between let, const and var in JavaScript?', a: 'var is function-scoped and hoisted (initialized as undefined), and can be redeclared. let and const are block-scoped and in the temporal dead zone until declared. const cannot be reassigned, but the object or array it points to can still be mutated.', level: 'Easy' },
    { q: 'What is event delegation in JavaScript?', a: 'Attaching one listener to a parent element and using event.target to handle events from its children, relying on event bubbling. It works for elements added later and reduces the number of listeners, e.g. a click handler on a table for all its Delete buttons.', level: 'Medium' },
    { q: 'Explain the ASP.NET Core middleware pipeline.', a: 'Each request passes through middleware components registered in Program.cs in order (exception handler, HTTPS redirection, static files, routing, CORS, authentication, authorization, endpoints). Each can handle the request, modify it, or call next() to pass it on; the response travels back in reverse order. Order matters: UseAuthentication must come before UseAuthorization.', level: 'Medium' },
    { q: 'Transient vs Scoped vs Singleton?', a: 'Transient: a new instance every time it is requested. Scoped: one instance per HTTP request (DbContext is scoped). Singleton: one instance for the whole application lifetime. Never inject a scoped service into a singleton (captive dependency).', level: 'Medium' },
    { q: 'ViewData vs ViewBag vs TempData?', a: 'ViewData is a dictionary and ViewBag a dynamic wrapper over the same data; both pass data from controller to view for the current request only. TempData survives one redirect (stored in a cookie or session) and is read once - used for success messages after Post-Redirect-Get.', level: 'Easy' },
    { q: 'How does model validation work in ASP.NET Core?', a: 'Data Annotations ([Required], [StringLength], [Range], [EmailAddress], custom ValidationAttribute or IValidatableObject) are checked during model binding and results go into ModelState. In MVC you check ModelState.IsValid; with [ApiController] an invalid model automatically returns 400 with a ValidationProblemDetails body. Client-side validation is only for UX - the server must always validate.', level: 'Medium' },
    { q: 'Code First vs Database First in EF Core?', a: 'Code First: write entity classes and DbContext, then Add-Migration and Update-Database create/alter the database - the code is the source of truth. Database First: the database already exists and Scaffold-DbContext generates entities and the context from it. Code First suits new projects; Database First suits existing databases.', level: 'Easy' },
    { q: 'What is the N+1 problem and how do Include and AsNoTracking help?', a: 'N+1 happens when you load N parents and then lazily load each parent\'s children with a separate query (1 + N queries). Include/ThenInclude (eager loading) or a Select projection fetch the related data in one query. AsNoTracking is a separate optimization: read-only queries skip change tracking, using less memory and CPU.', level: 'Hard' },
    { q: 'PUT vs PATCH?', a: 'PUT replaces the whole resource with the representation sent (missing fields become default); it is idempotent. PATCH applies a partial update (only the fields sent, e.g. JSON Patch). Typical responses: 204 No Content or 200 OK, 404 if the resource does not exist.', level: 'Easy' },
    { q: 'Which status codes should a REST API return for create, validation error, unauthenticated, forbidden and not found?', a: '201 Created (with Location header) for a successful POST, 400 Bad Request for validation errors, 401 Unauthorized when no/invalid token, 403 Forbidden when authenticated but not allowed, 404 Not Found when the resource does not exist; 409 Conflict for duplicates and 500 for unhandled server errors.', level: 'Easy' },
    { q: 'What is the Repository pattern and why add a service layer?', a: 'A repository hides data access behind an interface (IStudentRepository with GetAll, Add...), making code testable with mocks and independent of EF Core details. The service layer holds business rules and coordinates repositories; controllers only handle HTTP. This gives separation of concerns and easier unit testing.', level: 'Medium' },
    { q: 'Explain the JWT structure and how the API validates it.', a: 'A JWT has three Base64Url parts: header (algorithm), payload (claims such as sub, name, role, exp) and signature. The server signs it with a secret key at login. On every request the JwtBearer middleware recomputes the signature, checks issuer, audience and expiry, and builds the User principal from the claims. The payload is only encoded, not encrypted - never put secrets in it.', level: 'Hard' },
    { q: 'Access token vs refresh token?', a: 'The access token is short-lived (e.g. 15 minutes) and sent with every API call. The refresh token is long-lived, stored securely (HttpOnly cookie or database) and used only to get a new access token. Refresh tokens should be rotated on use and revocable, so stolen access tokens expire quickly.', level: 'Medium' },
    { q: 'Authentication vs authorization; roles vs claims vs policies?', a: 'Authentication answers "who are you?" (login, token validation); authorization answers "what may you do?". Roles are simple groups ([Authorize(Roles = "Admin")]). Claims are key-value facts about the user (Department=HR). Policies combine requirements (roles, claims, custom handlers) under a name, e.g. [Authorize(Policy = "CanApproveLeave")].', level: 'Medium' },
    { q: 'What is CORS and when do you need it?', a: 'Cross-Origin Resource Sharing is a browser security mechanism. When the React app (http://localhost:5173) calls the API on another origin (https://localhost:7001), the browser requires Access-Control-Allow-Origin headers from the API. Configure AddCors with specific origins, then app.UseCors() before authentication. CORS is not protection for the server against non-browser clients.', level: 'Medium' },
    { q: 'How do you prevent SQL injection and XSS?', a: 'SQL injection: never concatenate user input into SQL; use EF Core LINQ or parameterized queries (FromSqlInterpolated, SqlParameter). XSS: encode output (Razor and React encode by default), avoid Html.Raw and dangerouslySetInnerHTML with user content, validate input and set a Content-Security-Policy header.', level: 'Medium' },
    { q: 'useState vs useEffect in React?', a: 'useState stores component state and re-renders when it changes. useEffect runs side effects (API calls, subscriptions, timers) after render; its dependency array controls when it re-runs ([] = once after mount) and it can return a cleanup function.', level: 'Easy' },
    { q: 'How do you implement protected routes and role-based UI in React?', a: 'Store the token and user/roles in an AuthContext (useReducer). A ProtectedRoute component checks the context: if not logged in it renders <Navigate to="/login" />, if the role is not allowed it shows "Access denied", otherwise it renders <Outlet />. Menus hide buttons based on roles, but the API must still enforce authorization because UI checks can be bypassed.', level: 'Medium' },
    { q: 'Unit test vs integration test, and what is Moq used for?', a: 'A unit test checks one class in isolation (e.g. PayrollService) with dependencies replaced by fakes; Moq creates those fakes (new Mock<IStudentRepository>(), Setup, Verify). An integration test runs several real parts together - WebApplicationFactory starts the API in memory with an HttpClient, often with a test database - to verify routing, filters, serialization and data access.', level: 'Medium' },
    { q: 'git merge vs git rebase?', a: 'Merge combines branches by creating a merge commit and keeps the exact history. Rebase replays your commits on top of another branch, giving a linear history but rewriting commit ids - never rebase commits that others have already pulled. Teams usually work on feature branches and merge through pull requests after review and CI.', level: 'Medium' },
    { q: 'How do you deploy a .NET + React app and keep secrets safe?', a: 'Run dotnet publish -c Release and host on IIS (with the Hosting Bundle), Azure App Service or as a Docker container; build React with npm run build and serve the dist folder (from the API\'s wwwroot, nginx or Static Web Apps). Secrets (connection strings, JWT key) come from environment variables, App Service configuration, Key Vault or user-secrets in development - never committed to Git. A GitHub Actions pipeline builds, tests and deploys on every push to main.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Inventory: write the T-SQL for a stock-out of 5 notebooks (ProductId 4) inside a transaction, and a query listing products that never had any movement.',
      hint: 'BEGIN TRAN; INSERT movement; UPDATE stock; COMMIT; then NOT EXISTS or LEFT JOIN ... IS NULL.',
      solution: `BEGIN TRAN;
INSERT INTO StockMovements (ProductId, MovementType, Quantity, MovementDate) VALUES (4, 'OUT', 5, '2026-11-18');
UPDATE Products SET QtyInStock = QtyInStock - 5 WHERE ProductId = 4;
COMMIT;

SELECT p.Sku, p.Name
FROM Products p
WHERE NOT EXISTS (SELECT 1 FROM StockMovements m WHERE m.ProductId = p.ProductId);`,
    },
    {
      task: 'E-Commerce: write the POST /api/orders checkout action. Load prices from the database, check stock, reduce stock and save the order in one EF Core transaction; return 409 if stock is insufficient.',
      hint: 'await using var tx = await db.Database.BeginTransactionAsync(); ... await tx.CommitAsync();',
      solution: `[HttpPost]
[Authorize(Roles = "Customer")]
public async Task<ActionResult<OrderDto>> Checkout(CheckoutDto dto)
{
    int customerId = int.Parse(User.FindFirstValue("customerId")!);
    var ids = dto.Items.Select(i => i.ProductId).ToList();
    var products = await db.Products.Where(p => ids.Contains(p.ProductId)).ToDictionaryAsync(p => p.ProductId);

    await using var tx = await db.Database.BeginTransactionAsync();
    var order = new Order { CustomerId = customerId, OrderDate = DateTime.UtcNow, Status = "Placed" };
    foreach (var item in dto.Items)
    {
        if (!products.TryGetValue(item.ProductId, out var p)) return NotFound(new { message = $"Product {item.ProductId} not found" });
        if (p.Stock < item.Quantity) return Conflict(new { message = $"Only {p.Stock} left of {p.Name}" });
        p.Stock -= item.Quantity;
        order.Items.Add(new OrderItem { ProductId = p.ProductId, Quantity = item.Quantity, UnitPrice = p.Price });
    }
    db.Orders.Add(order);
    await db.SaveChangesAsync();
    await tx.CommitAsync();       // returning early above disposes tx -> automatic rollback
    return CreatedAtAction(nameof(GetById), new { id = order.OrderId }, order.ToDto());
}`,
    },
    {
      task: 'Hospital: write a query that shows each doctor\'s free slots for 2026-11-18, given a DoctorSlots table (DoctorId, SlotTime).',
      hint: 'Select from DoctorSlots and exclude booked rows with NOT EXISTS on Appointments for the same doctor, date and slot with Status = \'Booked\'.',
      solution: `SELECT d.FullName, s.SlotTime
FROM DoctorSlots s
JOIN Doctors d ON d.DoctorId = s.DoctorId
WHERE NOT EXISTS (
    SELECT 1 FROM Appointments a
    WHERE a.DoctorId = s.DoctorId
      AND a.AppointmentDate = '2026-11-18'
      AND a.SlotTime = s.SlotTime
      AND a.Status = 'Booked')
ORDER BY d.FullName, s.SlotTime;`,
    },
    {
      task: 'Write xUnit tests for CheckoutService: SAVE10 is capped at 500 and an empty cart throws.',
      hint: 'Assert.Throws<InvalidOperationException>(() => ...).',
      solution: `public class CheckoutServiceTests
{
    private readonly CheckoutService _sut = new();

    [Fact]
    public void Save10_is_capped_at_500()
    {
        var cart = new List<CartItem> { new("Power Bank", 1500m, 4) };
        var s = _sut.Checkout(cart, "SAVE10");
        Assert.Equal(500m, s.Discount);
        Assert.Equal(6490m, s.Total);
    }

    [Fact]
    public void Empty_cart_throws()
    {
        var ex = Assert.Throws<InvalidOperationException>(() => _sut.Checkout(new List<CartItem>(), null));
        Assert.Equal("Cart is empty", ex.Message);
    }
}`,
    },
    {
      task: 'Mock practical exam (90 minutes): build a Book Library mini project - Books table (Id, Title, Author, Price, Copies >= 0), a Web API with GET (search + paging), POST (validation, 409 on duplicate title), PUT, DELETE, and a React page listing books with a create form.',
      hint: 'Follow the Day 119 build plan in miniature: table -> entity -> DbContext -> migration -> controller -> Swagger test -> React list -> form.',
      solution: 'Checklist for self-evaluation: (1) Book entity with [Required] Title/Author, [Range(0, 100000)] Price, [Range(0, int.MaxValue)] Copies; (2) AppDbContext with unique index on Title; Add-Migration Init; Update-Database; (3) BooksController with [ApiController], async EF Core calls, CreatedAtAction for POST, NoContent for PUT/DELETE, NotFound for missing ids, Conflict for duplicates; (4) CORS policy for http://localhost:5173; (5) React BooksPage with useEffect + axios GET, loading and error state, BookForm with controlled inputs and client-side validation, refresh list after create; (6) commit after each step with clear messages.',
    },
  ],
  quiz: [
    {
      question: 'Why does the Inventory system store every change in a StockMovements table inside the same transaction as the stock update?',
      options: ['To make queries slower', 'Because SQL Server requires it', 'To keep an audit trail that always matches the current stock (all or nothing)', 'To avoid using primary keys'],
      answer: 2,
      explanation: 'If either statement fails the transaction rolls back both, so history and quantity never disagree.',
    },
    {
      question: 'In an e-commerce checkout, where should the product price come from?',
      options: ['The database, read on the server', 'The JSON sent by React', 'A hidden field in the form', 'The browser local storage'],
      answer: 0,
      explanation: 'Anything sent by the client can be modified; the server must load prices from the database.',
    },
    {
      question: 'What prevents two receptionists from booking the same doctor slot at the same moment?',
      options: ['A React useEffect', 'A UNIQUE constraint on (DoctorId, AppointmentDate, SlotTime) plus the service check', 'Sorting the appointments by time', 'Using GETDATE() as the default'],
      answer: 1,
      explanation: 'The service check gives a friendly message; the unique constraint is the final guarantee when requests race.',
    },
    {
      question: 'In the final practical exam pattern, which question carries the most marks?',
      options: ['C# console program', 'SQL Server queries', 'Viva', 'ASP.NET Core Web API CRUD with EF Core'],
      answer: 3,
      explanation: 'Q3 (Web API with EF Core, validation and status codes) carries 30 of the 100 practical marks.',
    },
    {
      question: 'Output: with SAVE10 (10% capped at 500) and GST 18%, what is the total for one item of 1500 x 4 (free shipping)?',
      options: ['6372.00', '6490.00', '6000.00', '7080.00'],
      answer: 1,
      explanation: 'Subtotal 6000, discount min(600, 500) = 500, 5500 + 18% GST (990) = 6490.00.',
    },
  ],
};
