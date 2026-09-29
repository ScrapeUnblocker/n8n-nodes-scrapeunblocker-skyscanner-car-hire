# n8n-nodes-scrapeunblocker-skyscanner-car-hire

This is an n8n community node. It lets you search **live car hire offers on Skyscanner** in your n8n workflows and get them as JSON: price, car model, rental company, booking site and its rating, seats, bags, fuel policy, mileage, cancellation and insurance flags, and a booking link. Pick up by place name or by exact Skyscanner location ID.

The node runs the [Skyscanner Car Hire Scraper](https://apify.com/scrapeunblocker/skyscanner-car-hire-scraper) Actor by ScrapeUnblocker on the [Apify](https://apify.com) platform with **your own Apify account**, waits for the run to finish and returns every scraped record as an n8n item.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Credentials](#credentials)
[Operations](#operations)
[Output](#output)
[Example workflow](#example-workflow)
[Pricing](#pricing)
[Compatibility](#compatibility)
[Resources](#resources)
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation. The npm package name is `n8n-nodes-scrapeunblocker-skyscanner-car-hire`.

## Credentials

The node authenticates with an **Apify API token**. Every run starts on the Apify account that owns the token and is billed to that account (see [Pricing](#pricing)).

### 1. Create an Apify account (skip if you already have one)

1. Go to [console.apify.com/sign-up](https://console.apify.com/sign-up) and sign up with email, Google or GitHub.
2. Confirm your email address if Apify asks you to.

The free Apify plan needs no credit card and includes a monthly usage credit, which is enough to try the node. Current plan limits are listed on [apify.com/pricing](https://apify.com/pricing).

### 2. Get your API token

1. Open [Apify Console](https://console.apify.com) and go to **Settings** → **API & Integrations**, or open [console.apify.com/settings/integrations](https://console.apify.com/settings/integrations) directly.
2. Find the **Personal API tokens** section.
3. Either use the existing token (the one marked *Default API token created on sign up*): click the eye icon to reveal it or the copy icon to copy it.
4. Or create a dedicated token for n8n (recommended, so you can revoke it without affecting anything else):
   1. Click **+ Add new token** (the button may read **Create new token**).
   2. In the **Create a new personal API token** dialog, enter a **Description** such as `n8n`.
   3. Optionally switch on **Set expiration date** and pick a date.
   4. Leave **Limit token permissions** switched off. A token with limited permissions may not be allowed to run this Actor or read its results.
   5. Click **Create** and copy the new token.

The token starts with `apify_api_`. Treat it like a password: anyone who has it can run Actors on your account. You can revoke or rotate it on the same page at any time.

> Working in an Apify **organization**? Switch to the organization in Apify Console first and copy a token from its **API & Integrations** page, so runs are billed to the organization.

### 3. Add the credential in n8n

1. Add the **Skyscanner Car Hire Scraper** node to a workflow and open it.
2. In **Credential to connect with**, choose **Create new credential**. (You can also create an **Apify API** credential from the n8n credentials list.)
3. Paste the token into **API Key** and click **Save**. n8n checks the token right away; an invalid token shows *Authorization failed - please check your credentials*.

Already have an **Apify API** credential in n8n (for example from the official Apify node)? This node uses the same credential type, so you can simply select it.

## Operations

Pick a **Resource** and an **Operation**. Each n8n input item starts one Apify run. List fields accept several values separated by commas or new lines, or an array returned by an expression.

| Resource | Operation | Fields | Returns |
|---|---|---|---|
| **Offer** | Search | **Pickup Location** (required) - City, airport or station to pick up the car, e.g. 'Madrid' or 'Malaga airport'. The name is resolved automatically<br>**Max Results** - Maximum number of offers to return, cheapest first. 0 returns every offer found | One item per rental offer, cheapest first |
| **Offer** | Search by Location ID | **Pickup Location ID** (required) - Skyscanner's own location ID of the pickup place, e.g. '95673800'. Use it for places the name search cannot reach or when a name is ambiguous<br>**Max Results** - Maximum number of offers to return, cheapest first. 0 returns every offer found | One item per rental offer, cheapest first |

### Options

| Option | Description |
|---|---|
| **Currency** | Currency of the prices (ISO code, e.g. EUR, USD or GBP). Defaults to EUR. |
| **Driver Age** | Age of the main driver. It affects availability and price. |
| **Dropoff Date** | Dropoff date as YYYY-MM-DD. Leave blank for 2 days after pickup. |
| **Dropoff Location** | Where to return the car, by name. Leave blank to return it to the pickup place. |
| **Dropoff Location ID** | Skyscanner's own location ID of the dropoff place. Overrides Dropoff Location. |
| **Dropoff Time** | Dropoff time as HH:MM (24-hour clock) |
| **Locale** | Language of the results (e.g. en-GB or es-ES). Defaults to en-GB. |
| **Market** | Country you are booking from (e.g. UK, US or ES). It affects prices and providers. Defaults to UK. |
| **Pickup Date** | Pickup date as YYYY-MM-DD. Leave blank for about 60 days from today. |
| **Pickup Time** | Pickup time as HH:MM (24-hour clock) |
| **Timeout (Seconds)** | Maximum run time of the Apify run. `0` keeps the Actor default. A run that times out fails the node. |

### How a run works

1. The node starts the Actor on your Apify account with the fields you set.
2. It waits for the run to finish.
3. It returns every record from the run's dataset as a separate n8n item.

The run is also visible in Apify Console under **Runs**. If a run fails or times out, the node error links to the run log and tells you whether any results were saved before it stopped.

Stopping the n8n execution only stops the node from waiting: the Apify run keeps going and its results are still charged. To stop it, abort the run in Apify Console under **Runs**, and use **Timeout (Seconds)** to cap long runs up front.

### Use as an AI Agent tool

The node can be attached to an n8n **AI Agent** as a tool, so the agent can call it on its own.

## Output

- One item per rental offer, cheapest first, with car model, rental company (vendor), booking site with its rating and review count, price and currency, seats, bags, fuel policy, mileage, free cancellation and insurance flags, SIPP code, pickup type, the resolved pickup and dropoff place, and a booking URL.

Fields of a returned item: `car`, `vendor`, `bookingProvider`, `bookingProviderRating`, `bookingProviderReviews`, `price`, `priceFormatted`, `currency`, `seats`, `bags`, `fuelPolicy`, `mileage`, `freeCancellation`, `excessInsuranceAvailable`, `collisionDamageWaiver`, `theftProtection`, `thirdPartyCover`, `sipp`, `pickupType`, `pickupId`, `pickupName`, `dropoffId`, `dropoffName`, `bookUrl`.

Example item (shortened):

```json
{
  "car": "Fiat 500",
  "vendor": "Exclusive",
  "bookingProvider": "VIPCars",
  "bookingProviderRating": 4.599999904632568,
  "bookingProviderReviews": 72477,
  "price": 31.559660476,
  "priceFormatted": "€31.56",
  "currency": "EUR",
  "seats": 4,
  "bags": 1,
  "fuelPolicy": "Full To Full",
  "mileage": "Unlimited",
  "freeCancellation": true,
  "excessInsuranceAvailable": true,
  "...": "..."
}
```

## Example workflow

To try the node in a minute, copy the workflow below, paste it into the n8n editor (Ctrl+V / Cmd+V), open the **Skyscanner Car Hire Scraper** node, select your **Apify API** credential and click **Execute workflow**.

```json
{
  "nodes": [
    {
      "parameters": {},
      "name": "When clicking 'Execute workflow'",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [
        0,
        0
      ]
    },
    {
      "parameters": {
        "resource": "offer",
        "operation": "search",
        "pickup": "Madrid",
        "maxResults": 5,
        "options": {}
      },
      "name": "Skyscanner Car Hire Scraper",
      "type": "n8n-nodes-scrapeunblocker-skyscanner-car-hire.skyscannerCarHireScraper",
      "typeVersion": 1,
      "position": [
        220,
        0
      ]
    }
  ],
  "connections": {
    "When clicking 'Execute workflow'": {
      "main": [
        [
          {
            "node": "Skyscanner Car Hire Scraper",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## Pricing

The node itself is free. The Actor is paid per result on Apify: **$1.50 per 1,000 offers** plus a tiny start fee per run ($0.00005), charged to the Apify account of your token. Every item the node returns counts as one result. The current price is always shown on the [Actor page](https://apify.com/scrapeunblocker/skyscanner-car-hire-scraper), and your spending is visible in Apify Console.

## Compatibility

Tested with n8n 2.40 (self-hosted).

## Resources

- [Skyscanner Car Hire Scraper Actor on Apify](https://apify.com/scrapeunblocker/skyscanner-car-hire-scraper)
- [Apify API tokens documentation](https://docs.apify.com/platform/integrations/api#api-token)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [ScrapeUnblocker](https://www.scrapeunblocker.com/?utm_source=n8n&utm_medium=integration&utm_campaign=n8n-skyscanner-car-hire-node) - the anti-bot scraping API behind the Actor

## Version history

- 0.1.0: Initial release
- 0.1.1: First release published from GitHub Actions with an npm provenance statement
