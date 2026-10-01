const fs = require("fs");
const path = require("path");
const { createPdf, outputDir } = require("./make-pdf");

const PROFILES = {
  "cv-a-frontend.pdf": `JORDAN ELLIS
Frontend Developer
jordan.ellis@example.com | +1 555 0142 | Austin, TX

SUMMARY
Frontend developer with 3 years building responsive web
applications using React and JavaScript.

TECHNICAL SKILLS
JavaScript, React, HTML, CSS, Tailwind CSS, Git,
REST APIs, Vite, Responsive Design, Component Architecture

WORK EXPERIENCE

Frontend Developer - Northwind Digital (2022 - Present)
- Built 12 client dashboards in React with Tailwind CSS.
- Improved page load time by 40 percent using code splitting.
- Consumed REST APIs and integrated third party payment flows.
- Reviewed code with a team of four through Git pull requests.

Junior Web Developer - Bright Loop Agency (2021 - 2022)
- Maintained HTML and CSS marketing sites for 15 clients.

EDUCATION
BSc Computer Science, State University (2017 - 2021)

PROJECTS
TaskBoard - React task manager with local storage.
Portfolio Site - Responsive portfolio built with Vite.

LANGUAGES
English (Native)`,

  "cv-b-data.pdf": `PRIYA RAMAN
Data Analyst
priya.raman@example.com | +1 555 0177 | Chicago, IL

SUMMARY
Data analyst with 4 years of experience turning raw business
data into reporting, dashboards and decision support.

TECHNICAL SKILLS
Python, SQL, Excel, Power BI, Tableau, Pandas, NumPy,
Data Cleaning, Statistical Analysis, Data Visualization,
ETL, A/B Testing

WORK EXPERIENCE

Data Analyst - Meridian Health Group (2021 - Present)
- Wrote 300+ SQL queries per month against a 40TB warehouse.
- Built executive dashboards in Tableau and Power BI.
- Automated monthly reporting with Python and Pandas,
  saving 60 hours per month.
- Partnered with clinical operations on patient volume trends.

Reporting Analyst - Kestrel Insurance (2019 - 2021)
- Produced weekly KPI reports and variance analysis for
  12 branch managers.

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

  "cv-c-marketing.pdf": `SOFIA MARCHETTI
Digital Marketing Specialist
sofia.marchetti@example.com | +39 555 0190 | Milan, Italy

SUMMARY
Digital marketing specialist with 5 years running SEO, paid
social and email campaigns for retail and lifestyle brands.

SKILLS
SEO, SEM, Google Analytics, Google Ads, Meta Ads,
Content Strategy, Copywriting, Email Marketing,
Social Media Management, HubSpot, Keyword Research,
Campaign Analytics, Paid Media

WORK EXPERIENCE

Digital Marketing Specialist - Bella Vita Group (2021 - Present)
- Increased organic traffic 180 percent in 18 months through
  technical SEO and content strategy.
- Managed a 60000 euro monthly paid social budget across
  Meta and Google Ads.
- Built email campaigns in HubSpot with a 34 percent
  average open rate.
- Reported on campaign ROI to the leadership team monthly.

Marketing Executive - Studio Nord (2019 - 2021)
- Ran social media channels for 8 retail clients.
- Wrote over 200 blog posts on product and lifestyle topics.

EDUCATION
BA Marketing and Communication,
University of Bologna (2016 - 2019)

CERTIFICATIONS
Google Analytics Certification (2022)
Meta Social Media Marketing Certificate (2023)
HubSpot Inbound Marketing Certification (2022)

LANGUAGES
Italian (Native), English (Fluent), Spanish (Conversational)`,
};

for (const [fileName, text] of Object.entries(PROFILES)) {
  const lines = text.split("\n");
  const filePath = path.join(outputDir, fileName);

  fs.writeFileSync(filePath, createPdf(lines));

  console.log(`wrote ${fileName} (${lines.length} lines)`);
}
