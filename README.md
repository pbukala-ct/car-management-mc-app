# Car Management — commercetools Merchant Center App

A custom Merchant Center application for Toyota that lets back-office users view and manage the vehicles registered in each customer's digital garage.

---

## Business Overview

Toyota customers register their vehicles in a connected digital experience (website or app). Each vehicle is stored as a **commercetools Custom Object** under the `customer-vehicles` container, keyed by the customer's ID. The object holds a list of vehicles (VIN, model, trim, year, colour, licence plate) and flags which one is the customer's primary vehicle.

This Merchant Center app gives **business users** — service advisors, CRM managers, customer care agents — a direct window into that vehicle data without needing API access or developer involvement. They can:

- See at a glance which vehicles every customer has registered
- Correct data errors in vehicle details (e.g. a misspelled colour or wrong licence plate)
- Mark a different vehicle as the customer's primary one
- Add a vehicle that was missed during self-registration
- Remove a vehicle that no longer belongs to the customer

---

## Features

### Customer Garage List

- Paginated table of every customer who has a vehicle registered
- Resolves the customer's name and email from the CT `customers` resource for readable display
- Shows the number of vehicles and which model/year is set as primary
- One click to open the full garage for a customer
- Delete a garage record with a confirmation prompt

### Garage Editor

- Header shows the customer's name/email and a back-to-list button
- **Left panel** — vehicle cards, each showing:
  - Model and year (bold)
  - Full VIN
  - Trim · Colour · Licence plate
  - A blue **Primary** badge on the primary vehicle
  - **Set as Primary** button (one click, clears the flag on all other vehicles)
  - **Remove** button with immediate effect on the in-memory state
- **Right panel** — editable form that appears when a vehicle card is clicked:
  - VIN and Model displayed read-only (they are identifiers)
  - Trim, Year, Colour, Licence Plate — all editable text fields
  - **Primary Vehicle** checkbox
- **Add Vehicle** button opens a full creation form (all fields editable including VIN and Model)
- Unsaved-changes guard — browser warns if you navigate away with pending edits
- **Save** commits the entire updated vehicles array back to the Custom Object
- **Delete Garage** removes the entire Custom Object after confirmation

---

## Demo Walkthrough

### Prerequisites

- Access to the commercetools Merchant Center for the `toyota-poc` project
- The app running locally (`yarn start` from this directory)

### Step 1 — Open the app

Navigate to:

```
https://mc.europe-west1.gcp.commercetools.com/toyota-poc/car-management
```

Log in with your MC credentials if prompted. You land on the **Customer Garages** list.

### Step 2 — Show the list

Point out:
- The table resolves real customer names/emails from CT — this isn't raw data, it's a user-friendly view
- The **Primary Vehicle** column immediately tells an agent which car the customer considers their main one
- All columns read from the `customer-vehicles` Custom Object container in real time

### Step 3 — Open a garage

Click the customer name link for the demo customer (e.g. the one with two vehicles — a RAV4 and a bZ4X).

Point out in the editor:
- The **Primary** badge on the RAV4
- Two vehicle cards, each showing full detail at a glance

### Step 4 — Edit a vehicle field

1. Click the **bZ4X** card — the right panel populates with its editable fields
2. Change the **Licence Plate** field (e.g. `ZX-456-E` → `ZX-999-E`)
3. The **Save** button activates (indicating unsaved changes)

### Step 5 — Change the primary vehicle

1. On the bZ4X card, click **Set as Primary**
2. The blue **Primary** badge moves instantly from the RAV4 to the bZ4X
3. Click **Save** — the change is persisted to the CT Custom Object

### Step 6 — Add a vehicle

1. Click **Add Vehicle** (top-right of the left panel)
2. Fill in a new vehicle in the right panel form:
   - VIN: `JTDKAMFU0N3133456`
   - Model: `Yaris Cross`
   - Trim: `Dynamic`
   - Year: `2023`
   - Colour: `Pearl White`
   - Licence Plate: `YC-001-A`
3. Click **Add** — the new card appears in the left panel
4. Click **Save** to persist

### Step 7 — Remove a vehicle

1. Click the **Remove** button on any vehicle card
2. The card disappears immediately
3. Click **Save** to commit

---

## Running Locally

```bash
# From the project directory
yarn install   # first time only
yarn start
```

Then open:

```
https://mc.europe-west1.gcp.commercetools.com/toyota-poc/car-management
```

The MC development authentication proxy serves the local bundle automatically — no separate login step is needed beyond your normal MC session.

---

## Deploying to Netlify

1. Register the app in **MC → Organisation settings → Custom Applications** to obtain a `CUSTOM_APPLICATION_ID`
2. Add these environment variables in Netlify → Site configuration → Environment variables:
   - `CUSTOM_APPLICATION_ID` — from the registration step above
   - `APP_URL` — your Netlify deployment URL (e.g. `https://car-management-mc.netlify.app`)
3. Push to `main` — the `netlify.toml` in this repo configures the build automatically

---

## Technical Notes

| Detail | Value |
|---|---|
| CT project | `toyota-poc` |
| Custom Object container | `customer-vehicles` |
| Custom Object key | customer ID (UUID) |
| OAuth scopes | `view_customers`, `view_key_value_documents`, `manage_key_value_documents` |
| Entry point URI | `car-management` |
| CT region | `gcp-eu` (`europe-west1`) |
| MC AppKit version | `27.3.0` |
| React | `19` |
