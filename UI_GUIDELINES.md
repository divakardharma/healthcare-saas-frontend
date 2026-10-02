# UI Guidelines

## Page Structure

All authenticated pages should use:

- DashboardLayout
- PageHeader
- Card where content needs a container

Example:

DashboardLayout
→ PageHeader
→ Page Content

## Common Components

Use existing common components whenever possible:

- Button
- Input
- Loader
- Modal
- ConfirmModal
- Table
- Card
- PageHeader
- EmptyState
- FormActions

Do not create duplicate versions of these components inside module folders.

## Styling

- Use styled-components for common reusable components.
- Module-specific pages can use normal CSS or CSS Modules.
- Use values from the existing theme where applicable.
- Do not create separate color systems for individual modules.
- Keep the existing Header and Sidebar consistent.

## Forms

Use the common Input component.

For form actions, use FormActions where applicable.

## Tables

Use the common Table component for tabular data.

When there is no data, use EmptyState.

## Confirmation

Use ConfirmModal for delete or other confirmation actions.

## Important

Module-specific UI can be created inside the respective module.

If a UI element is reusable across multiple modules, consider adding it to the common components instead of creating separate copies.