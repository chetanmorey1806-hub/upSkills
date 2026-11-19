export default {
  lesson: 'day-09-merge-join-concat',
  minutes: 30,
  intro: 'Combine tables like SQL JOINs or VLOOKUP: inner/left/outer merges, different key names, anti-joins with indicator, and stacking files with concat.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: '`orders` has 10 rows; 2 of them have a `cust_id` that is **not** in `customers` (every customer appears once). How many rows does `orders.merge(customers, on="cust_id", how="left")` return?',
      options: ['8', '10', '12', 'it depends on the number of customers'],
      answer: 1,
      explain: 'A **left** join keeps every row of the left table (10). The 2 unmatched orders get NaN in the customer columns. An inner join would return 8. Rows can only *increase* if the right table has duplicate keys (row explosion).',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this print?',
      code: `import pandas as pd
a = pd.DataFrame({"id": [1, 2, 3], "x": ["a", "b", "c"]})
b = pd.DataFrame({"id": [2, 3, 4], "y": ["p", "q", "r"]})
print(len(a.merge(b, on="id")))
print(len(a.merge(b, on="id", how="outer")))
m = a.merge(b, on="id", how="left", indicator=True)
print(m["_merge"].tolist())`,
      expected: "2\n4\n['left_only', 'both', 'both']",
      explain: 'Inner keeps only matching ids (2, 3). Outer keeps all ids from both sides (1, 2, 3, 4). `indicator=True` adds a `_merge` column saying where each row came from – `left_only` rows are the unmatched ones.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: ['Use `left_on="cust_id", right_on="customer_id"` when the key columns have different names', '`validate="many_to_one"` raises an error if the right table has duplicate keys', '`pd.concat([jan, feb, mar])` stacks the three tables on top of each other', '`df1.join(df2)` joins on the **index** by default', '`pd.concat` matches rows by a key column like merge does'],
      answers: [0, 1, 2, 3],
      explain: '`concat` just glues tables along an axis (rows by default) – it aligns by column names / index, not by a key column. Use `merge` for key-based lookups. `validate` is a cheap safety check against row explosion.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Build `report` from `orders`, `customers` and `products`:\n1. left-merge `orders` with `customers` on `cust_id`\n2. merge with `products` – note the key is `product_id` in orders but `pid` in products (`left_on` / `right_on`)\n3. add `revenue` = `qty × price`\n\nThen `city_rev`: a dict `{city: total revenue}` (use groupby on `report`).',
      example: { title: 'merging on different key names', code: 'marks.merge(students, left_on="roll", right_on="roll_no", how="left")' },
      starter: 'import pandas as pd\norders = pd.DataFrame({"order_id": [1, 2, 3, 4], "cust_id": [10, 11, 10, 12],\n                       "product_id": ["P1", "P2", "P2", "P1"], "qty": [2, 1, 3, 1]})\ncustomers = pd.DataFrame({"cust_id": [10, 11, 12], "city": ["Pune", "Delhi", "Pune"]})\nproducts = pd.DataFrame({"pid": ["P1", "P2"], "price": [500, 1200]})\n\n# TODO: report, city_rev\n',
      solution: 'import pandas as pd\norders = pd.DataFrame({"order_id": [1, 2, 3, 4], "cust_id": [10, 11, 10, 12],\n                       "product_id": ["P1", "P2", "P2", "P1"], "qty": [2, 1, 3, 1]})\ncustomers = pd.DataFrame({"cust_id": [10, 11, 12], "city": ["Pune", "Delhi", "Pune"]})\nproducts = pd.DataFrame({"pid": ["P1", "P2"], "price": [500, 1200]})\n\nreport = (orders.merge(customers, on="cust_id", how="left")\n                .merge(products, left_on="product_id", right_on="pid", how="left"))\nreport["revenue"] = report["qty"] * report["price"]\ncity_rev = report.groupby("city")["revenue"].sum().to_dict()\n',
      tests: [
        { call: 'len(report)', expect: 4 },
        { call: 'sorted(int(x) for x in report["revenue"])', expect: [500, 1000, 1200, 3600] },
        { call: '{k: int(v) for k, v in city_rev.items()}', expect: { Pune: 5100, Delhi: 1200 } },
      ],
      explain: 'Chaining two merges builds a star-schema report (fact table + dimension tables). With different key names both columns (`product_id` and `pid`) stay in the result – drop one if you like. The row count stays 4 because every lookup table has unique keys.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: '**Anti-join.** Find the customers who have **never ordered**. Store their names in `inactive` (a Python list, in the order of the `customers` table). Use `merge(..., how="left", indicator=True)` and keep the `left_only` rows.',
      example: { title: 'indicator', code: 'm = students.merge(fees, on="roll", how="left", indicator=True)\nnot_paid = m[m["_merge"] == "left_only"]' },
      starter: 'import pandas as pd\ncustomers = pd.DataFrame({"cust_id": [1, 2, 3, 4, 5],\n                          "name": ["Asha", "Ravi", "Neha", "Karan", "Meera"]})\norders = pd.DataFrame({"order_id": [101, 102, 103, 104], "cust_id": [2, 4, 2, 9]})\n\n# TODO: inactive = [...]\n',
      solution: 'import pandas as pd\ncustomers = pd.DataFrame({"cust_id": [1, 2, 3, 4, 5],\n                          "name": ["Asha", "Ravi", "Neha", "Karan", "Meera"]})\norders = pd.DataFrame({"order_id": [101, 102, 103, 104], "cust_id": [2, 4, 2, 9]})\n\nm = customers.merge(orders[["cust_id"]].drop_duplicates(), on="cust_id", how="left", indicator=True)\ninactive = m.loc[m["_merge"] == "left_only", "name"].tolist()\n',
      tests: [
        { call: 'list(inactive)', expect: ['Asha', 'Neha', 'Meera'] },
      ],
      explain: 'Rows that exist only in the left table are tagged `left_only`. A simpler alternative is `customers[~customers["cust_id"].isin(orders["cust_id"])]`. Note order 104 has cust_id 9 that is not a customer – that would be a `right_only` row in an outer join (a data-quality issue to report).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: '**Stack monthly files.** Combine `jan`, `feb` and `mar` into one DataFrame `q1` with a **fresh index 0..n-1** (`ignore_index=True`), then compute `q1_total` (int) = total `amount`.',
      example: { title: 'concat', code: 'all_batches = pd.concat([batch_a, batch_b], ignore_index=True)' },
      starter: 'import pandas as pd\njan = pd.DataFrame({"month": ["Jan", "Jan"], "amount": [1200, 800]})\nfeb = pd.DataFrame({"month": ["Feb"], "amount": [1500]})\nmar = pd.DataFrame({"month": ["Mar", "Mar", "Mar"], "amount": [700, 900, 400]})\n\n# TODO: q1, q1_total\n',
      solution: 'import pandas as pd\njan = pd.DataFrame({"month": ["Jan", "Jan"], "amount": [1200, 800]})\nfeb = pd.DataFrame({"month": ["Feb"], "amount": [1500]})\nmar = pd.DataFrame({"month": ["Mar", "Mar", "Mar"], "amount": [700, 900, 400]})\n\nq1 = pd.concat([jan, feb, mar], ignore_index=True)\nq1_total = int(q1["amount"].sum())\n',
      tests: [
        { call: 'q1.index.tolist()', expect: [0, 1, 2, 3, 4, 5], msg: 'use ignore_index=True for a fresh index' },
        { call: 'q1["month"].tolist()', expect: ['Jan', 'Jan', 'Feb', 'Mar', 'Mar', 'Mar'] },
        { call: 'int(q1_total)', expect: 5500 },
      ],
      explain: 'Without `ignore_index=True` the old indexes repeat (0, 1, 0, 0, 1, 2), which breaks later `loc` lookups. In real projects you often read many files in a loop and pass the list of DataFrames to one `pd.concat` call.',
    },
  ],
};
