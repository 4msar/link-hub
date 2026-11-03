# Admin Panel Documentation

## Admin Page Setup

The admin panel is located at `/hq` and provides a secure interface for adding new links to the hub.

### Configuration

1. **Set up the Admin PIN**

    Add the following to your `.env.local` file:

    ```env
    ADMIN_PIN=your-secure-pin-here
    ```

    ⚠️ **Important**: Use `ADMIN_PIN` (not `NEXT_PUBLIC_ADMIN_PIN`) to keep it server-side only and secure.

2. **Access the Admin Panel**

    Navigate to `/hq` in your browser. You'll be prompted to enter the PIN.

### Features

- **PIN Protection**: The page is locked behind a PIN that must be set in your environment variables
- **Add Links**: Once authenticated, you can add new links with the following fields:
    - **Name**: Display name for the link
    - **Slug**: URL-friendly identifier (e.g., `my-link`)
    - **Value**: The actual URL or text content
    - **Type**: Choose from:
        - `url` - Standard URL links
        - `text` - Text content
        - `link` - Internal links

### API Endpoints

The admin panel uses two API endpoints:

1. **POST `/api/admin/verify`**
    - Verifies the PIN
    - Body: `{ pin: string }`

2. **POST `/api/admin/links`**
    - Creates a new link
    - Body: `{ pin: string, name: string, slug: string, value: string, type: string }`
    - Automatically revalidates the links cache after creation

### Security Notes

- The PIN is only stored server-side (not exposed to the browser)
- The PIN is verified on every link creation request
- Make sure to use a strong PIN in production
- Keep your `.env.local` file out of version control

### Usage Flow

1. Visit `/hq`
2. Enter your admin PIN
3. Fill out the form with link details
4. Click "Add Link"
5. The new link will be created and the cache will be revalidated

## Public Submissions

Visitors can suggest links at `/submit`. Submissions land in a separate `submissions` table and only reach the main collection once you approve them.

### Reviewing

Visit `/hq/review` (same PIN as `/hq`).

- **Pending** (default) shows submissions waiting for review.
- **Archived** shows every submission still in the table, with a pending/rejected badge.
- **Approve** adds the link to the main collection and removes the submission. The pencil button lets you edit the title or link first.
- **Reject** keeps the submission with status `rejected`. The same link cannot be submitted again.
- **Delete** removes the submission permanently.

### API Endpoints

- **POST `/api/submit`** (public): `{ title, link }`. Rate limited to 5 per 10 minutes per IP (per server instance); duplicates of existing items or submissions return 409.
- **GET `/api/admin/submissions?status=pending|all&page=`**: requires the `x-admin-pin` header.
- **POST `/api/admin/submissions/:id`**: `{ action: "approve" | "reject", title?, link? }`, requires `x-admin-pin`. Approving revalidates the links cache.
- **DELETE `/api/admin/submissions/:id`**: requires `x-admin-pin`.

These proxy to the backend's `/api/v1/submissions/:project` endpoints. Apply the backend migration first:

```bash
cd ../pockets-backend && yarn db:migrate
```
