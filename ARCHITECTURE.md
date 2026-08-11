# Architecture Notes

## Raw SQL instead of an ORM
The project uses `pg` and parameterized SQL so database behavior is explicit. This is especially useful for inventory because the critical path needs row locks and a transaction that is easy to see and explain in a technical interview.

## Stock confirmation transaction
A challan remains Draft until confirmation. Confirmation starts a database transaction, locks the challan row, loads each item, locks each product row with `FOR UPDATE`, checks available stock, deducts stock and records an OUT movement. Any failure throws and causes a rollback. This prevents two concurrent confirmations from both spending the same inventory.

## Snapshotting sales lines
`challan_items` stores `product_name_snapshot` and `unit_price_snapshot`. If the product name or price changes later, historical challans and invoices still represent what was sold at the time.

## Role-based security
JWT middleware identifies the user. The role middleware protects API routes. The frontend also removes navigation/actions that are not relevant to the current role, while the backend remains the real security boundary.

## Auditability
Stock movements, users and challan confirmation are timestamped and linked to the acting user. Admins can query the audit endpoint to inspect system activity.

## Frontend structure
React Context owns authentication. Axios attaches the JWT automatically. React Router handles page navigation. The visual language intentionally stays restrained: dark operations rail, neutral content surface, teal action color, compact tables and responsive cards.
