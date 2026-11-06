// Describes actual preview behavior; never used as merchant sales policies.
export const previewPolicies = {
  shipping: {
    intro: "Explore the collection. There is nothing to ship yet.",
    sections: [
      [
        "A collection of concepts",
        "All products and packaging shown in this edition are design concepts. Adding them to the preview bag does not reserve stock, request a shipment or create an order.",
      ],
      [
        "Delivery dates and charges",
        "There are no delivery promises, carrier services, shipping fees or customs estimates in this preview. The displayed USD prices illustrate the products only.",
      ],
      [
        "When a real collection opens",
        "A future merchant must publish the actual shipping destinations, costs, timelines and import responsibilities before accepting purchases.",
      ],
    ],
  },
  returns: {
    intro: "No purchases means no returns or refunds to request.",
    sections: [
      [
        "Change your selection freely",
        "Increase, decrease or remove items in your preview bag whenever you like. These changes have no financial effect.",
      ],
      [
        "No money is taken",
        "There is no payment processing or order creation in this edition. No return label, refund request or customer service submission is generated.",
      ],
      [
        "Before real purchases begin",
        "The operating merchant must publish its verified return address, eligibility, time limits, costs and refund process. Those terms are not established by this concept preview.",
      ],
    ],
  },
  privacy: {
    intro: "A preview that asks for very little.",
    sections: [
      [
        "What your bag stores",
        "Concept identifiers and quantities are saved in local storage on this browser only. No address, payment details or gift message is requested or stored. Clearing site storage removes the saved bag; denied storage falls back to the current page session with a warning.",
      ],
      [
        "Browsing and preferences",
        "Gift-guide and collection filters appear in the page URL so that refreshing preserves your choices. They do not identify a recipient. This application includes no advertising trackers, analytics integrations, account registration or newsletter submission.",
      ],
      [
        "Hosting and future use",
        "The server or hosting provider may process ordinary request information such as IP addresses and browser headers. A public operator must identify itself and describe its hosting and privacy practices before publishing. Future Shopify shopping uses a separate necessary cart cookie and merchant policies.",
      ],
    ],
  },
  terms: {
    intro: "A complete storefront experience, presented as a concept.",
    sections: [
      [
        "What you are exploring",
        "Morrow & Muse is a working brand direction. The products, AI-created imagery, specifications and USD prices are illustrative. They do not establish actual stock, product performance, certification or an offer to sell physical goods.",
      ],
      [
        "What the interactions do",
        "Browse, filter and compare concepts, inspect their details and try a browser-only bag. No action here charges you, creates an order or confirms a purchase. The preview cannot be used to place a real order.",
      ],
      [
        "Images and identity",
        "Concept scenes may differ in small packaging or label details. The working name has not been cleared as a trademark or domain. Displaying this website does not by itself grant a visitor a license to redistribute its source code or imagery.",
      ],
    ],
  },
} as const;
