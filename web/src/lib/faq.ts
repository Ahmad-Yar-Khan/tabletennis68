/*
 * Frequently asked questions, shown on the /contact page.
 *
 * HOW TO EDIT: change the text between the quotes, add a new { question, answer } block,
 * or delete one. Keep answers short (2–3 sentences). Line breaks in an answer are kept.
 * Then run `npm run build` (or push) to update the site.
 *
 * These are PLACEHOLDER answers: confirm each one with the shop owner before launch.
 *
 * LATER: this can move to Sanity (an "faq" document type with question/answer fields, or an
 * array on Site settings) so the owner can edit it in the admin panel. Keep the `FaqItem` shape
 * and only the data source in the contact page needs to change.
 */

export type FaqItem = {
  question: string;
  answer: string;
};

export const faqs: FaqItem[] = [
  {
    question: "How long does delivery take?",
    answer:
      "Orders are usually dispatched within 1–2 working days. Delivery takes 2–3 working days to major cities and 3–5 working days to other areas of Pakistan.",
  },
  {
    question: "Do you offer cash on delivery (COD)?",
    answer:
      "Yes. Cash on delivery is available all over Pakistan. You pay the courier when your order arrives. Bank transfer and mobile wallets (JazzCash, Easypaisa) are also accepted.",
  },
  {
    question: "Can I return or exchange an item?",
    answer:
      "Unused items in their original packaging can be exchanged within 7 days of delivery. If something arrives damaged or wrong, message us on WhatsApp within 48 hours with a photo and we will sort it out. Rubbers that have been glued to a blade cannot be returned.",
  },
  {
    question: "Are your products original?",
    answer:
      "Yes. We only sell genuine products from the brands we stock, sourced from authorised suppliers. No copies, no fakes. If you are unsure about an item, ask us on WhatsApp and we will send more photos.",
  },
];
