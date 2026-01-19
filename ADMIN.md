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
