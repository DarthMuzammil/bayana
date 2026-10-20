# Handoff: M14 · Channel partner (new launches)

**For the builder (don't paste this part)**
- **Why:** a reviewer called Bayana "a glorified Outlook plus calendar". Brokers selling new launches earn most of their money as developers' channel partners (CPs), and this module shows that money.
- **Paste** everything below the rule into `PRODUCT_SPEC.md` as §8.17, then add M14 to §8.14 and §8.16. As parts ship, move them into §2–§7 and add a changelog line.
- **Conventions:** UI only (§8.0). Follow `AGENTS.md`: tokens, `Dialog`, `store.viewerCan()`, `displayPhone()`, `log()` / `pushNotification()` / `recordAudit()`, `BarList`, ≥ 44 px taps.
- **Seed:** stays in Bengaluru with Better Days Realty. All developers, projects and RERA numbers are fictional; rename any that collide with a real company.
- **Changes existing tests will see:** bells go Arjun 2 → 3, Neha 1 → 2, Priya 1 → 2. Lead sources gets a 9th row and the permissions table 3 more. The guided demo stays at 12 steps. Bump storage to `daira:v9:`.
- **Rates:** GST 18%, TDS 2% and Meta's ₹0.86 per India marketing message are constants. The footer says "Rates are demo settings. Confirm with your CA."

---

### 8.17 M14 · Channel partner (new launches)
Developers pay CP brokerage late, and only after the buyer has paid a set share of the price. They pay only if the CP's registration of the buyer hasn't lapsed and no other CP registered the buyer first. Launches sell out in days, and many leads arrive in WhatsApp groups. Four parts, built in this order.

- **Navigation:**
  - **New launches** (Work, everyone, icon `bolt`, after Properties): tabs **Launches · Registrations**. It opens on Launches for people with `runLaunches`, otherwise Registrations.
  - **Brokerage** (first in Manage; `viewReceivables`; new `rupee` icon).
  - Phones: both in **More**; the bottom tabs don't change.
- **Permissions:** `viewReceivables` "See brokerage receivables" (Owner, Manager) · `manageReceivables` "Record invoices and payments" (Owner) · `runLaunches` "Create and send launch broadcasts" (Owner, Manager).
- **Who sees money:** the Owner sees all bookings. Managers see their team's agents' bookings with amounts. Sales and Pre-sales never see brokerage %, amounts or tax lines (commercially sensitive), only the status of their own bookings.
- **Seed** (`src/data/channelPartner.ts`):

| Developer | CP manager | Brokerage | Billable once buyer paid | Pays within | Registration valid |
|---|---|---|---|---|---|
| Halcyon Habitats | Rakesh Iyengar, +91 98450 70112 | 3% | 10% | 45 days of invoice | 30 days |
| Banyan Bay Developers | Deepa Raghunath, +91 99000 81455 | 2.5% | 10% | 60 days | 30 days |
| Kestrel Developers | Joseph D'Souza, +91 97400 62318 | 2% | 15% | 30 days | 45 days |
| Larkspur Estates | Nikhil Thakur, +91 96320 50947 | 2% | 20% | 30 days | 30 days |

- **Seed projects:**
  - **Halcyon Grove**, Whitefield: 2 BHK ₹1.1–1.35 Cr, 3 BHK ₹1.6–1.9 Cr.
  - **Banyan Bay Residences**, off Sarjapur Road, HSR Layout: 2 BHK ₹1.35–1.55 Cr, 3 BHK ₹1.85–2.1 Cr.
  - **Kestrel Heights**, Koramangala: 3 BHK ₹2.6–3.1 Cr, 4 BHK ₹3.3–3.8 Cr.
  - **Larkspur Residences**, Indiranagar: 3 BHK ₹2.6–3.2 Cr.
  - RERA numbers are plainly fake ("PRM/KA/RERA/DEMO/0142").

#### 8.17.1 Brokerage receivables (the Owner's money screen)
- **Booking:** a unit sold through the firm, with dated milestones **Booked → Margin money paid → Invoice raised → Payment received**.
  - Brokerage = agreement value × %. The detail sheet shows **GST @ 18%** (added), **TDS @ 2%** (deducted) and **Net receivable**, in rupees.
  - Headline figures are brokerage before GST and TDS.
  - **Statuses:** *Waiting for 10% payment* · *Ready to invoice* · *Due in N days* · **Overdue N days** (red; past the developer's terms) · *Paid* · **Disputed** (red, with a reason; still counted as pending).
- **Screen** ✅ "Brokerage", subtitle "What developers owe Better Days Realty · brokerage before GST and TDS":
  - **Stat strip:** **Pending** "₹42 L · 8 bookings" · **Overdue** "₹15.4 L · 3" · **Ready to invoice** "₹5.7 L · 1" · **Received · last 30 days** "₹3.5 L". New `formatLakh` drops a trailing ".0".
  - **Charts:** `BarList`s with table views: **Pending by developer** (largest first) and **Age since booking** (0–30 / 31–60 / 61–90 / 90+ days, in order; tooltip "₹10.6 L · 2 bookings"). Tapping a bar filters.
  - **Filters:** chips All · Overdue · Ready to invoice · Awaiting payment · Disputed · Paid, plus a developer dropdown. Most overdue first; **Paid · N** folded last.
  - **Desktop:** a table (buyer · unit, project, agent, agreement, brokerage, 4-dot milestone track, due, next-step button: **Mark margin paid** / **Raise invoice** / **Send reminder**).
  - **Phone:** cards ("Rajiv Menezes · Halcyon Grove B-1204", "₹4.86 L · 3% of ₹1.62 Cr", the track, "Overdue 43 days", a full-width button).
  - **Row detail:** milestones, tax lines, an invoice chip "BDR/26-27/014 · PDF (demo)" 🎭, reminder history, **Undo last step**, **Mark disputed** / **Resolve**. **Export CSV** (`exportData`, audited).
- **Recording** ✅ (`manageReceivables`; dates Today … 14 days ago):
  - **Raise invoice:** the next number is prefilled ("BDR/26-27/025", financial year from today).
  - **Record payment:** the amount is fixed to the net receivable; optional UTR; a "TDS certificate received" tick.
  - **Short payments:** Disputed · "Amount differs".
- **Send reminder** ✅ 🎭 (Owner, Manager): tone **Gentle · Firm** and an editable WhatsApp preview to the CP manager.
  - **Gentle:** "Hi Rakesh, a gentle reminder from Better Days Realty. Our invoice BDR/26-27/014 for ₹5,63,760 (Rajiv Menezes, Halcyon Grove B-1204) was raised on <date> and is 43 days past your 45-day terms. Could you share the payment date? Thanks, Arjun Khanna"
  - **Firm** ends: "…is 43 days overdue. Please release it this week, or tell us what's pending from our side."
  - **Send:** toast "Reminder sent to Rakesh Iyengar (Halcyon Habitats)", then "Last reminder · just now". About 4 s later the history gets the scripted reply 🎭 "Noted. Checking with accounts, will confirm the date by Friday."
- **From a won deal** ✅: if the lead has an active registration, the deal dialog offers "New-launch booking at Kestrel Heights" (off by default) and **Unit**.
  - Saving creates *Booked · today* (agreement = agreed price), sets the registration to **Booked** and notifies the Owner.
  - Lapsed registration → amber note: "Registration lapsed on <date>. The developer may refuse brokerage."
- **Sales and Pre-sales:** **My bookings** (foot of Registrations) shows status words only, e.g. "Invoice raised · awaiting developer payment".
- **Hooks:**
  - **Audit** (new type **Channel partner**): invoice raised, payment recorded (amount and invoice number), step undone, dispute marked or resolved.
  - **Notifications:**
    - Payment → the agent: "Kestrel Developers paid the brokerage for Vikrant Saluja. Your share goes out with this month's payout."
    - Dispute → the Owner and the agent's manager.
  - **Timeline:** "Booked Kestrel Heights T1-1404 · ₹2.65 Cr".
- **Seed bookings** (days ago; fixed invoice numbers; no linked lead, because they predate Bayana):

| Buyer | Project · unit | Agent | Agreement | Brokerage | Booked · margin · invoiced · paid | Today |
|---|---|---|---|---|---|---|
| Rajiv Menezes | Halcyon Grove B-1204 | Vivek S. | ₹1.62 Cr | 3% · ₹4.86 L | 120 · 95 · 88 (/014) | Overdue 43 days |
| Sunaina Dutta | Halcyon Grove A-0703 | Ayesha K. | ₹1.18 Cr | 3% · ₹3.54 L | 60 · 45 · 40 (/022) · 6 | Paid |
| Arun Pai | Halcyon Grove C-1502 | Manoj K. | ₹1.86 Cr | 3% · ₹5.58 L | 150 · 130 · 120 (/009) · 60 | Paid |
| Prerna Chatterjee | Banyan Bay 2-1103 | Sneha P. | ₹1.48 Cr | 2.5% · ₹3.70 L | 110 · 100 · 95 (/012) | Overdue 35 days |
| Manish Kothari | Banyan Bay 3-0405 | Rohit V. | ₹1.96 Cr | 2.5% · ₹4.90 L | 30 | Waiting for 10% payment |
| Farida Lokhandwala | Banyan Bay 1-0902 | Meghna D. | ₹1.52 Cr | 2.5% · ₹3.80 L | 75 · 60 · 58 (/019) | Due in 2 days |
| Vikrant Saluja | Kestrel Heights T2-1801 | Priya N. | ₹3.42 Cr | 2% · ₹6.84 L | 70 · 50 · 48 (/021) | Overdue 18 days |
| Ruchi Bhargava | Kestrel Heights T1-0602 | Aditya R. | ₹2.85 Cr | 2% · ₹5.70 L | 25 · 8 | Ready to invoice |
| Harpreet Sodhi | Kestrel Heights T2-2203 | Ritu B. | ₹3.10 Cr | 2% · ₹6.20 L | 45 · 30 · 28 (/024) | Disputed: "Developer says another CP registered this buyer first" |
| Neeraj Wadhwa | Larkspur Residences 3B | Divya I. | ₹3.00 Cr | 2% · ₹6.00 L | 15 | Waiting for 20% payment |

  - **By developer:** Kestrel ₹18.7 L, Banyan Bay ₹12.4 L, Larkspur ₹6 L, Halcyon ₹4.9 L.
  - **By age:** ₹16.6 L / ₹6.2 L / ₹10.6 L / ₹8.6 L.
  - **Managers:** Neha ₹18.5 L, Rahul ₹11.1 L, Farah ₹12.4 L, 1 overdue each.
- **Checks:**
  1. **Owner:** the strip and bars show the values above.
  2. **Rajiv's detail:** ₹4,86,000 · GST ₹87,480 · TDS −₹9,720 · Net ₹5,63,760.
  3. **Record payment on Rajiv:**
     - Strip: "₹37.1 L · 7 bookings", "₹10.5 L · 2", Received "₹8.4 L".
     - Audit: "Recorded payment ₹5,63,760 from Halcyon Habitats (BDR/26-27/014)".
     - Vivek is notified; Undo restores everything.
  4. **Raise invoice on Ruchi Bhargava:** "BDR/26-27/025", "Due in 30 days".
  5. **Gentle reminder:** the preview has "Hi Rakesh", "₹5,63,760" and "43 days"; the reply appears within 5 s.
  6. **Neha:** "₹18.5 L · 3 bookings"; Send reminder only.
  7. **Priya:** no Brokerage nav. My bookings lists Vikrant Saluja with no "₹".

#### 8.17.2 Developer client registration
- **Lead panel → Overview:** a **Developer registrations · N** card below the Deal panel. Each entry: "Kestrel Heights · Kestrel Developers", a status chip, "Valid until Fri, 23 Oct · 3 days left" with a thin meter, and who registered it. **Register with a developer** is for anyone who can see the lead (a bottom sheet on phones).
- **Register dialog** ✅:
  - **Fields:**
    - Project.
    - Buyer name (from the lead).
    - Mobile (`displayPhone`, read-only).
    - **PAN**, optional ("Some developers ask for it"; error "PAN should look like ABCDE1234F").
    - How you registered: Developer's CP portal / Email to CP manager / WhatsApp to CP manager.
    - Registered on: Today … 30 days ago.
    - Developer's reference.
  - **Add screenshot** 🎭 attaches a placeholder "registration-proof.png · demo".
  - **Footer:** "Bayana keeps your proof and reminds you before it lapses. It doesn't submit anything to the developer."
  - **Stamp:** "Recorded by Priya N. · Tue, 20 Oct, 2:14 PM".
  - **PAN** always shows masked ("XXXXXX234K", new `maskPan`); `seeFullNumbers` gets **Show**.
- **Conflict warning** ✅: checks every active registration in the firm, even on leads the viewer can't see, for the same phone and developer.
  - **Alert:** "Already registered with Kestrel Developers by Kavya R. on <date> · valid until <date>. The firm is already protected; registering again won't extend it and may confuse the developer's CP desk."
  - The submit button becomes **Register anyway**.
- **Statuses:**
  - **Registered**
  - **Expiring** (≤ 7 days, amber; "Expires tomorrow")
  - **Lapsed** ("Lapsed 2 days ago")
  - **Disputed** (manual: Another CP registered first / Developer has no record / Other)
  - **Booked** (countdown hidden)
- **Actions:**
  - **Renew:** new date and proof; restarts the window.
  - **Mark disputed:** anyone who can see the lead.
  - **Resolve** (Owner, Manager): "Developer accepted ours", or "Lost to another CP" (→ Lapsed).
- **Registrations tab** ✅:
  - Chips All · Expiring · Lapsed · Disputed · Booked, with counts; soonest expiry first.
  - Each row: buyer (→ chat), project, agent ("Registered by Kavya R. · lead now with Aditya R."), status, days left, **Renew**.
  - Lead visibility (§3.8) applies; cards on phones.
- **Hooks:**
  - **Notifications:**
    - At 7, 3 and 1 days left → the registering agent and the lead owner.
    - At 1 day and on lapsing → their manager too.
    - **Register anyway** → both managers and the Owner (also audited).
  - **Sales Today:** a banner like the check-in reminder at 3 days or fewer: "Ananya Rao's registration with Kestrel Developers expires in 3 days", with **Renew** and **Open lead**.
  - **Timeline** (kind `registration`): registered, renewed, disputed, resolved, "Registered anyway (already registered by Kavya R.)".
  - Time doesn't pass in the demo; alerts come from the seed.
- **Seed registrations:**

| Lead | Project | By | Registered | Today |
|---|---|---|---|---|
| Ananya Rao | Kestrel Heights | Priya N. | 42 days ago | Expiring · 3 days |
| Ishita Banerjee | Larkspur Residences | Priya N. | 10 days ago | Registered · 20 days |
| Kunal Mehra | Larkspur Residences | Priya N. | 12 days ago | Disputed · Another CP registered first |
| Gaurav Bhatia | Kestrel Heights | Kavya R. (lead now Aditya R.) | 30 days ago | Registered · 15 days |
| Meenakshi Raghavan | Larkspur Residences | Sameer J. | 32 days ago | Lapsed 2 days ago |
| Deepak Malhotra | Kestrel Heights | Ritu B. | 20 days ago | Registered · 25 days |
| Ishaan Malik | Halcyon Grove | Ayesha K. | 5 days ago | Registered · 25 days |
| Nisha Kulkarni | Banyan Bay Residences | Rohit V. | 23 days ago | Expiring · 7 days |
| Vikram Shah | Banyan Bay Residences | Sneha P. | 29 days ago | Expires tomorrow |

  - **Seed notifications:** Priya (Ananya), Rohit (Nisha), Sneha and Farah (Vikram), Sameer and Neha (Meenakshi lapsed). Arjun: "Halcyon Habitats: invoice BDR/26-27/014 for Rajiv Menezes is 43 days overdue." (opens Brokerage).
- **Checks:**
  8. **Priya, Ananya Rao's lead:** "Expiring · 3 days left"; the banner on her Today; the alert in her bell.
  9. **Priya registers Mohit Saxena** with Larkspur, PAN "ABCPM1234K": "Registered · 30 days left", "XXXXXX234K", a timeline entry. "ABC123" blocks Save.
  10. **The Owner registers Gaurav Bhatia** with Kestrel: the Kavya R. alert and **Register anyway**; saving is audited.
  11. **Owner's Registrations:** All 9 · Expiring 3 · Lapsed 1 · Disputed 1. **Renew** on Ananya → "45 days left", Expiring 2.
  12. **Ananya won with the booking ticked:** the registration reads Booked; a new booking shows "Waiting for 15% payment"; Pending rises by the agreed price × 2%.

#### 8.17.3 Launch broadcasts
- **Launches tab** ✅: cards with project, developer, locality, configurations and prices, launch day and status (Draft / Sent). Sent cards add "Sent 8 · Delivered 8 · Read 6 · Replied 2" and the cost. Without `runLaunches`: "N of your buyers match", and no New launch or Send.
- **New launch** (`runLaunches`; full screen on phones with a sticky button), three steps:
  1. **Details:** project (or a new one), configurations (BHK + price from/to, **+ Add configuration**), launch day, EOI, possession, and **RERA number**, which is required: "Add the RERA number. It must appear in every launch message."
  2. **Audience** ✅: open, visible leads matched on three on/off chips that update the count live ("13 buyers match"):
     - **Locality:** one of the lead's localities is the launch's.
     - **BHK:** a configured BHK. Investment flats match any; villas never.
     - **Budget:** overlaps that configuration's price band.

     Each row has a tick, the buyer, the owner, the reason ("HSR Layout · 2 BHK · ₹1.4–1.5 Cr fits ₹1.35–1.55 Cr") and "Registered with Banyan Bay" where it applies.
     - **Note** 🧱: "Only buyers who agreed to receive updates from Better Days Realty are included."
     - **Empty:** "None of your team's buyers match. Turn a filter off to widen it."
  3. **Preview** ✅: a WhatsApp bubble tagged **Marketing**:
     - "Hi Vikram, Banyan Bay Residences · Phase 2 by Banyan Bay Developers launches on Sat, 24 Oct off Sarjapur Road, HSR Layout. • 2 BHK · ₹1.35–1.55 Cr • 3 BHK · ₹1.85–2.1 Cr. Possession Dec 2029 · RERA PRM/KA/RERA/DEMO/0142. Early-access EOI ₹2 L (refundable). Want floor plans and a site visit? — Arjun, Better Days Realty"
     - Buttons **Yes, send details** · **Not now**, footer "Reply STOP to opt out".
     - Cost: "Marketing template · 13 × ₹0.86 = ₹11.18 (Meta's India rate, charged per delivered message)".
- **Send to 13 buyers** 🎭 (asks to confirm):
  - **Chats:** each one gets the message tagged "Template · New launch".
  - **Ticks:** grey ✓ → grey ✓✓ (~1.5 s) → blue ✓✓ (3–6 s), with text labels. New tokens `--tick-sent` / `--tick-read`, ≥ 3:1 contrast.
  - **Scripted:**
    - Omkar Jadhav: "Not delivered · not on WhatsApp".
    - Vinay Prabhu, Tejas Patil and Bhavana Shenoy: delivered, unread.
    - **Replies** (6–8 s): Nisha Kulkarni "Yes, send details", Aman Khurana "Any 3 BHK on a high floor, east facing? Is the EOI fully refundable?", Asha Thomas "Yes, send details".
  - **Replies** reach the inbox as buyer messages (1 unread, at the top).
  - **Cost** becomes "₹10.32 · 12 delivered".
  - **Other audiences:** about 80% read, and the first quarter reply.
- **Hooks:**
  - **Timeline** (kind `launch`): sent, each reply.
  - **Notifications:** reply → the lead owner ("Nisha Kulkarni replied to the Banyan Bay Phase 2 launch: 'Yes, send details'").
  - **Audit:** "Sent Banyan Bay Residences · Phase 2 to 13 buyers · ₹11.18".
- **Seed launches:**
  - **Banyan Bay Residences · Phase 2:** **Draft**, launching in 4 days, EOI ₹2 L. The Owner's 13 matches: Vikram Shah, Sana Fathima, Nisha Kulkarni, Rakesh Gupta, Aman Khurana, Sowmya Ramesh, Vinay Prabhu, Rajesh Naidu, Swati Agarwal, Tejas Patil, Bhavana Shenoy, Omkar Jadhav, Asha Thomas. Budget off adds Pooja Venkatesh, Zoya Begum and Nandini Bose.
  - **Halcyon Grove · Tower D:** **Sent 6 days ago**, 8 / 8 / 6 / 2 🧱, ₹6.88.
- **Checks:**
  13. **Owner, draft:** "13 buyers match"; Vikram Shah and Nisha Kulkarni tagged registered. Budget off → 16.
  14. **Preview:** has "Hi Vikram", the RERA number and "₹11.18". Clearing RERA blocks Next.
  15. **Send:** within 10 s:
      - Delivered 12 · Read 9 · Replied 3, and Omkar "Not delivered".
      - Nisha's chat has her reply, with 1 unread in the inbox.
      - Cost "₹10.32"; an audit entry.
  16. **Neha:** the empty state. **Priya:** no New launch or Send.

#### 8.17.4 WhatsApp group lead capture
- **Why simulated:** Bayana can't read a broker's own WhatsApp groups, so agents paste or share messages in.
- **Add lead** gets **Type it in · Paste a message**. Paste mode has:
  - a text box, "Paste a message forwarded from a broker group";
  - sample chips;
  - **Group** (HSR Brokers Network / Whitefield Property Connect / Bengaluru Realty Partners / Other);
  - **Read message**.
- **Reading** ✅ 🎭 (`parseGroupMessage` in `ai.ts`; rules, not a model):
  - **Finds:** the mobile (+91, 0 and spaces allowed); the name (after "Client:", "Contact" or "Call"); BHK or villa; localities (plus "HSR", "Kora", "WF"); the budget ("1.8–2.1 Cr", "90 L"); must-haves.
  - Fields show **AI · Suggested** until edited or **Confirm all**.
- **Number belongs to: The buyer · The broker who posted it.** The broker option is pre-picked on "brokers call", "Properties" or "Estates". Then the name becomes "Client of Manjunath (MG Estates)" with a **Co-broking** tag.
- **Listing text** ("available", "resale", "for sale"): "This looks like a property for sale, not a buyer's requirement." with **It's a buyer, continue**.
- **Saving:**
  - The §3.7 duplicate check runs on the found number.
  - Add lead's ownership rules apply.
  - Source is **Broker groups**, a new Lead sources row (Messaging, "Manual capture", 7 a week 🧱, ₹0).
  - The original message becomes a team note with numbers masked.
  - Timeline: "Captured from WhatsApp group HSR Brokers Network".
- **Phone share sheet** 🎭: account menu → **Simulate a forwarded group message** → "Share to" (WhatsApp, **Bayana**, Messages, Copy). **Bayana** opens paste mode with sample 1.
- **Samples:**
  1. "*URGENT requirement* 3 BHK in HSR / Koramangala, budget 1.8–2.1 Cr, OC received only. Client: Arnav Sethi 98451 62730. Loan pre-approved."
  2. "Need 2 BHK Indiranagar near metro, 1.5–1.7 Cr. Contact Farhan 97390 22814" (Farhan Qureshi's number)
  3. "Client requirement: 4 BHK villa Whitefield, 3.5–4 Cr, NRI visiting next week. Brokers with options call Manjunath 99000 81234 (MG Estates)"
  4. "Resale available: 2 BHK Indiranagar, 1,150 sq ft, ₹1.65 Cr, east facing. Call 98860 44120"
- **Checks:**
  17. **Sample 1** suggests Arnav Sethi, 98451 62730, 3 BHK, HSR Layout + Koramangala, ₹1.8–2.1 Cr. Saving creates a Broker groups lead with a masked note.
  18. **Sample 2:** the duplicate alert names Farhan Qureshi; Merge works.
  19. **Sample 3:** the broker is pre-picked and the lead tagged Co-broking. **Sample 4:** shows the listing note.
  20. **Phone (390 px):** the share sheet opens paste mode; controls ≥ 44 px. Layout audits pass for both new screens at 390, 900 and 1440 px.

#### 8.17.5 Today and the guided demo
- **Team home** (`viewReceivables`): a **Brokerage from developers** card below the four daily tiles (the tiles don't change):
  - "Brokerage pending · ₹42 L · 3 overdue"
  - "₹15.4 L overdue · oldest 43 days (Halcyon Habitats)"
  - "Registrations: 3 expiring this week · 1 lapsed"

  The money lines open Brokerage on Overdue; the last opens Registrations. Neha sees "₹18.5 L · 1 overdue" and "1 expiring · 1 lapsed".
- **AI digest** 🎭 adds: "Kestrel Developers owes ₹18.7 L across 3 bookings; Vikrant Saluja's invoice is 18 days overdue." and "3 developer registrations expire this week."
- **Guided demo (optional):** the finish card gets **Bonus: money developers owe you** (still "of 12").
  - It views as the Owner, opens Brokerage on Overdue, opens Rajiv Menezes and sends the Gentle reminder.
  - Panel text: "Developers pay brokerage late. Arjun sees ₹42 L pending and 3 overdue, and chases the oldest invoice in one tap."
  - `DEMO_SCRIPT.md` gains "send a launch" and "paste a group message".
- **Check:**
  21. The Owner's Today reads "₹42 L · 3 overdue"; tapping it shows 3 overdue rows.
- **Build notes:** `channelPartner.ts` (seed, rates, helpers incl. `buyersForLaunch`) · `BrokerageView`, `LaunchesView` · a `new-launch` Marketing template · saved keys `cp-bookings`, `cp-registrations`, `launches` · a `channel-partner` e2e suite.

#### 8.17.6 Out of scope
- Submitting registrations to developers or their portals.
- Real WhatsApp sending, template approval, opt-in collection, or reading groups automatically.
- Real invoices, e-invoicing, GST/TDS filing, bank feeds, agent payouts and part-payments.
- Brokerage slabs, incentive schemes and launch inventory.
- Using the developer's % on the leaderboard (won deals still count 2%).
- Moving the seed out of Bengaluru.
