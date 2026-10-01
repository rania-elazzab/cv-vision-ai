const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { generateCareerMatches } = require("../services/aiService");
const { generateCareerInsight } = require("../services/aiService");

const CVS = {
  A: `Jordan Ellis
Frontend Developer
Email: jordan.ellis@example.com | Phone: +1 555 0142

SUMMARY
Frontend developer with 3 years building responsive web applications using React and JavaScript.

SKILLS
JavaScript, React, HTML, CSS, Tailwind CSS, Git, REST APIs, Vite

EXPERIENCE
Frontend Developer, Northwind Digital (2022 - Present)
- Built 12 client dashboards in React with Tailwind CSS.
- Improved page load time by 40 percent using code splitting.
- Consumed REST APIs and integrated third party payment flows.

Junior Web Developer, Bright Loop Agency (2021 - 2022)
- Maintained HTML and CSS marketing sites.

EDUCATION
BSc Computer Science, State University (2017 - 2021)

PROJECTS
TaskBoard - React task manager with local storage.
Portfolio Site - Responsive portfolio built with Vite.

LANGUAGES
English (Native)`,

  B: `Priya Raman
Data Analyst
Email: priya.raman@example.com | Phone: +1 555 0177

SUMMARY
Data analyst with 4 years of experience turning raw business data into reporting and dashboards.

SKILLS
Python, SQL, Excel, Power BI, Tableau, Pandas, NumPy, Data Cleaning, Statistical Analysis, Data Visualization

EXPERIENCE
Data Analyst, Meridian Health Group (2021 - Present)
- Wrote 300+ SQL queries per month against a 40TB warehouse.
- Built executive dashboards in Tableau and Power BI.
- Automated monthly reporting with Python and Pandas, saving 60 hours.

Reporting Analyst, Kestrel Insurance (2019 - 2021)
- Produced weekly KPI reports and variance analysis for 12 branch managers.

EDUCATION
MSc Statistics, Riverside Institute of Technology (2018 - 2019)
BSc Mathematics, Anna University (2014 - 2017)

CERTIFICATIONS
Google Data Analytics Professional Certificate (2022)
Tableau Desktop Specialist (2023)

PROJECTS
Retail Demand Forecasting - time series model in Python.
Customer Churn Analysis - logistic regression on 2M rows.

LANGUAGES
English (Fluent), Tamil (Native), Hindi (Fluent)`,

  C: `Sofia Marchetti
Digital Marketing Specialist
Email: sofia.marchetti@example.com | Phone: +39 555 0190

SUMMARY
Digital marketing specialist with 5 years running SEO, paid social and email campaigns for retail brands.

SKILLS
SEO, SEM, Google Analytics, Google Ads, Meta Ads, Content Strategy, Copywriting, Email Marketing, Social Media Management, HubSpot, Keyword Research, Campaign Analytics

EXPERIENCE
Digital Marketing Specialist, Bella Vita Group (2021 - Present)
- Increased organic traffic 180 percent in 18 months through technical SEO and content strategy.
- Managed a 60000 euro monthly paid social budget across Meta and Google Ads.
- Built email campaigns in HubSpot with a 34 percent average open rate.

Marketing Executive, Studio Nord (2019 - 2021)
- Ran social media channels for 8 retail clients and wrote 200 blog posts.

EDUCATION
BA Marketing and Communication, University of Bologna (2016 - 2019)

CERTIFICATIONS
Google Analytics Certification (2022)
Meta Social Media Marketing Certificate (2023)
HubSpot Inbound Marketing Certification (2022)

LANGUAGES
Italian (Native), English (Fluent), Spanish (Conversational)`,
};

const run = async () => {
  const results = {};

  for (const [key, cv] of Object.entries(CVS)) {
    console.log(`\n=========== CV ${key} ===========`);

    const matches = await generateCareerMatches(cv);
    const insight = await generateCareerInsight(cv);

    results[key] = { matches, insight };

    console.log(
      "ROLES:",
      matches.map((m) => `${m.title} (${m.matchScore})`).join(" | ")
    );
    console.log("INSIGHT HEADLINE:", insight.headline);
    console.log("INSIGHT DIRECTION:", insight.strongestCareerDirection);
  }

  const titles = (k) => results[k].matches.map((m) => m.title).join(" ~ ");

  console.log("\n\n=== COMPARISON ===");
  for (const k of ["A", "B", "C"]) console.log(`${k}: ${titles(k)}`);

  const overlaps = [];
  const sets = ["A", "B", "C"].map((k) =>
    new Set(results[k].matches.map((m) => m.title.toLowerCase()))
  );

  for (let i = 0; i < sets.length; i += 1) {
    for (let j = i + 1; j < sets.length; j += 1) {
      const shared = [...sets[i]].filter((t) => sets[j].has(t));
      overlaps.push(`${"ABC"[i]}vs${"ABC"[j]}: ${shared.length} shared [${shared.join(", ")}]`);
    }
  }

  console.log("\nOVERLAP:");
  overlaps.forEach((o) => console.log("  " + o));

  const insights = ["A", "B", "C"].map((k) => results[k].insight.headline);
  console.log("\nDISTINCT INSIGHT HEADLINES:", new Set(insights).size, "of 3");
};

run().catch((error) => {
  console.error("FAILED:", error.message);
  process.exit(1);
});
