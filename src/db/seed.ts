import { db } from './index';
import { categories, packages, siteSettings, mediaAssets } from './schema';

async function seed() {
  console.log('🌱 Seeding database with verified Sun Path Lab information...');

  // 1. Initial Site Settings (Single row: 'default')
  await db
    .insert(siteSettings)
    .values({
      id: 'default',
      siteName: 'Sun Path Lab',
      siteTagline: 'Pathology & Diagnostic Testing Centre',
      primaryPhone: '09300755303',
      secondaryPhone: '7000719306',
      landline: '0761-3562885',
      whatsappNumber: '9300755303',
      address:
        'Shop No. 2, Sidhhi Vinayak Plaza, in front of Jabalpur Hospital Old Gate, Russell Chowk, Jabalpur, MP - 482001',
      landmark: 'Opposite Jabalpur Hospital Old Gate, Russell Chowk',
      plusCode: '5W6P+XC, Jabalpur, Madhya Pradesh',
      googleMapsUrl:
        'https://maps.google.com/?q=Shop+2+Sidhhi+Vinayak+Plaza+Russell+Chowk+Jabalpur',
      operatingHours: 'Open daily until 10:00 PM',
      noticeBanner:
        'Doorstep home sample collection available across Jabalpur. Call or WhatsApp 09300755303 to schedule.',
      isNoticeBannerActive: true,
      heroHeadline: 'Reliable Pathology & Blood Testing in Jabalpur',
      heroSubheadline:
        'Serving Russell Chowk & Jabalpur with accurate diagnostic tests, thyroid & iron panels, full body health checkups, and convenient home sample collection.',
      aboutOverview:
        'Sun Path Lab is a trusted diagnostic laboratory in Russell Chowk, Jabalpur. We are dedicated to providing accurate and timely pathology services, from routine blood examinations to specialized health panels, backed by polite staff, hygienic sample handling, and doorstep collection.',
      homeCollectionInfo:
        'Our trained phlebotomists follow strict aseptic sample collection protocols and visit your home or office at your preferred time across Jabalpur.',
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteSettings.id,
      set: {
        updatedAt: new Date(),
      },
    });

  // 2. Verified Categories
  const categoryData = [
    {
      id: 'cat-full-body',
      name: 'Full Body Health Packages',
      slug: 'full-body-health-packages',
      description: 'Comprehensive preventive health panels covering vital organ functions and blood indices.',
      sortOrder: 1,
    },
    {
      id: 'cat-thyroid',
      name: 'Thyroid & Hormonal Tests',
      slug: 'thyroid-hormone-tests',
      description: 'Accurate evaluation of thyroid gland function including TSH, T3, and T4 hormones.',
      sortOrder: 2,
    },
    {
      id: 'cat-iron',
      name: 'Iron & Anemia Profiles',
      slug: 'iron-anemia-profiles',
      description: 'Detailed screening for iron deficiency, hemoglobin health, and iron-binding capacity.',
      sortOrder: 3,
    },
    {
      id: 'cat-routine',
      name: 'Routine Blood & Metabolic Panels',
      slug: 'routine-blood-metabolic-panels',
      description: 'Essential daily diagnostic tests including CBC, blood sugar, lipid profiles, and liver & kidney screening.',
      sortOrder: 4,
    },
  ];

  for (const cat of categoryData) {
    await db
      .insert(categories)
      .values({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sortOrder: cat.sortOrder,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: categories.id,
        set: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          sortOrder: cat.sortOrder,
          updatedAt: new Date(),
        },
      });
  }

  // 3. Verified Diagnostic Packages
  const initialPackages = [
    {
      id: 'pkg-full-body-essential',
      name: 'Full Body Health Checkup (Essential)',
      slug: 'full-body-health-checkup-essential',
      description:
        'A comprehensive preventive screening panel evaluating vital organ markers, blood counts, and metabolic indicators. Popular among families in Jabalpur for annual wellness monitoring.',
      regularPrice: '1499.00',
      discountPrice: '999.00',
      tests: [
        'Complete Blood Count (CBC with ESR)',
        'Fasting Blood Sugar (Glucose)',
        'Lipid Profile (Total Cholesterol, HDL, LDL, Triglycerides)',
        'Liver Function Test (SGOT, SGPT, Bilirubin)',
        'Kidney Function Test (Serum Creatinine, Blood Urea, Uric Acid)',
        'Thyroid Stimulating Hormone (TSH)',
        'Urine Routine & Microscopic Examination',
      ],
      categoryId: 'cat-full-body',
      imageUrl: '/images/lab_image.webp',
      isFeatured: true,
      isPublished: true,
      sampleType: 'Blood & Urine Sample',
      fastingRequired: '10–12 Hours Fasting Required',
      reportTime: 'Same Day (Within 12–24 Hours)',
      seoTitle: 'Full Body Health Checkup in Jabalpur | Sun Path Lab',
      seoDescription:
        'Book an affordable Full Body Health Checkup at Sun Path Lab, Russell Chowk, Jabalpur. Includes CBC, Liver, Kidney, Lipid & Thyroid tests. Home collection available.',
      sortOrder: 1,
    },
    {
      id: 'pkg-thyroid-profile',
      name: 'Complete Thyroid Profile (T3, T4, TSH)',
      slug: 'thyroid-profile-t3-t4-tsh',
      description:
        'Accurate diagnostic assessment of thyroid hormone activity. Recommended for patients experiencing unexplained fatigue, weight changes, mood fluctuations, or thyroid disorders.',
      regularPrice: '600.00',
      discountPrice: '450.00',
      tests: [
        'Total Triiodothyronine (T3)',
        'Total Thyroxine (T4)',
        'Thyroid Stimulating Hormone (TSH Ultra-sensitive)',
      ],
      categoryId: 'cat-thyroid',
      imageUrl: '/images/reception.webp',
      isFeatured: true,
      isPublished: true,
      sampleType: 'Blood Sample',
      fastingRequired: 'Fasting preferred (Morning sample recommended)',
      reportTime: 'Same Day',
      seoTitle: 'Thyroid Profile Test in Jabalpur | Sun Path Lab',
      seoDescription:
        'Accurate Thyroid Profile (T3, T4, TSH) testing at Sun Path Lab, Russell Chowk, Jabalpur. Reliable results and doorstep home collection.',
      sortOrder: 2,
    },
    {
      id: 'pkg-iron-deficiency',
      name: 'Iron Deficiency & Anemia Profile',
      slug: 'iron-deficiency-anemia-profile',
      description:
        'Detailed diagnostic evaluation of circulating iron levels, iron stores, and red blood cell production. Essential for diagnosing iron deficiency anemia, lethargy, or weakness.',
      regularPrice: '900.00',
      discountPrice: '699.00',
      tests: [
        'Serum Iron',
        'Total Iron Binding Capacity (TIBC)',
        'Transferrin Saturation Percentage',
        'Serum Ferritin',
        'Complete Blood Count (CBC with RBC Indices)',
      ],
      categoryId: 'cat-iron',
      imageUrl: '/images/lab_image.webp',
      isFeatured: true,
      isPublished: true,
      sampleType: 'Blood Sample',
      fastingRequired: 'Overnight fasting recommended (10–12 hours)',
      reportTime: 'Same Day / Next Day',
      seoTitle: 'Iron Deficiency & Anemia Profile in Jabalpur | Sun Path Lab',
      seoDescription:
        'Comprehensive Iron Test and Anemia Profile in Jabalpur at Sun Path Lab. Fast and reliable reports at affordable prices.',
      sortOrder: 3,
    },
    {
      id: 'pkg-routine-blood-cbc',
      name: 'Complete Blood Count (CBC) with ESR',
      slug: 'complete-blood-count-cbc-esr',
      description:
        'The foundational pathology test assessing overall health status, white blood cell defenses, red blood cell oxygenation, and platelet counts.',
      regularPrice: '350.00',
      discountPrice: '250.00',
      tests: [
        'Hemoglobin (Hb)',
        'Total Leucocyte Count (TLC / WBC)',
        'Differential Leucocyte Count (DLC)',
        'Platelet Count',
        'Red Blood Cell Count (RBC)',
        'PCV / Hematocrit',
        'MCV, MCH, MCHC indices',
        'Erythrocyte Sedimentation Rate (ESR)',
      ],
      categoryId: 'cat-routine',
      imageUrl: '/images/reception.webp',
      isFeatured: false,
      isPublished: true,
      sampleType: 'Blood Sample (EDTA)',
      fastingRequired: 'No fasting required',
      reportTime: 'Same Day (Within 2–4 Hours)',
      seoTitle: 'CBC Test in Jabalpur | Complete Blood Count | Sun Path Lab',
      seoDescription:
        'Get rapid Complete Blood Count (CBC) test in Russell Chowk, Jabalpur at Sun Path Lab. Quick turnaround and accurate pathology reports.',
      sortOrder: 4,
    },
    {
      id: 'pkg-diabetes-monitoring',
      name: 'Diabetes & Glucose Monitoring Panel',
      slug: 'diabetes-glucose-monitoring-panel',
      description:
        'Essential blood panel to screen and monitor blood sugar regulation and average glucose control over the preceding 3 months.',
      regularPrice: '750.00',
      discountPrice: '550.00',
      tests: [
        'Fasting Blood Glucose (Blood Sugar Fasting)',
        'Post Prandial Blood Glucose (PPBS - 2 hours after meal)',
        'HbA1c (Glycosylated Hemoglobin)',
        'Estimated Average Glucose (eAG)',
        'Urine Routine for Sugar & Ketones',
      ],
      categoryId: 'cat-routine',
      imageUrl: '/images/lab_image.webp',
      isFeatured: false,
      isPublished: true,
      sampleType: 'Blood & Urine Sample',
      fastingRequired: '10–12 Hours Fasting required for fasting sample',
      reportTime: 'Same Day',
      seoTitle: 'Diabetes HbA1c & Blood Sugar Test in Jabalpur | Sun Path Lab',
      seoDescription:
        'Accurate Diabetes Monitoring Panel with HbA1c and Blood Sugar testing at Sun Path Lab, Russell Chowk, Jabalpur. Home collection available.',
      sortOrder: 5,
    },
  ];

  for (const pkg of initialPackages) {
    await db
      .insert(packages)
      .values({
        id: pkg.id,
        name: pkg.name,
        slug: pkg.slug,
        description: pkg.description,
        regularPrice: pkg.regularPrice,
        discountPrice: pkg.discountPrice,
        tests: pkg.tests,
        categoryId: pkg.categoryId,
        imageUrl: pkg.imageUrl,
        isFeatured: pkg.isFeatured,
        isPublished: pkg.isPublished,
        sampleType: pkg.sampleType,
        fastingRequired: pkg.fastingRequired,
        reportTime: pkg.reportTime,
        seoTitle: pkg.seoTitle,
        seoDescription: pkg.seoDescription,
        sortOrder: pkg.sortOrder,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: packages.id,
        set: {
          name: pkg.name,
          slug: pkg.slug,
          description: pkg.description,
          regularPrice: pkg.regularPrice,
          discountPrice: pkg.discountPrice,
          tests: pkg.tests,
          categoryId: pkg.categoryId,
          imageUrl: pkg.imageUrl,
          isFeatured: pkg.isFeatured,
          isPublished: pkg.isPublished,
          sampleType: pkg.sampleType,
          fastingRequired: pkg.fastingRequired,
          reportTime: pkg.reportTime,
          seoTitle: pkg.seoTitle,
          seoDescription: pkg.seoDescription,
          sortOrder: pkg.sortOrder,
          updatedAt: new Date(),
        },
      });
  }

  // 4. Register Pre-existing Local Media Assets
  const assets = [
    {
      id: 'asset-logo',
      publicId: 'local:logo',
      url: '/images/logo.jpeg',
      format: 'jpeg',
      width: 1280,
      height: 853,
      bytes: 101330,
      altText: 'Sun Path Lab Official Signage & Identity',
      caption: 'Sun Path Lab Diagnostic Centre Logo & Identity',
    },
    {
      id: 'asset-iso',
      publicId: 'local:iso9001-2015',
      url: '/images/ISO9001-2015.webp',
      format: 'webp',
      width: 500,
      height: 500,
      bytes: 8972,
      altText: 'ISO 9001:2015 Certified Laboratory Badge',
      caption: 'Certified Quality Management System',
    },
    {
      id: 'asset-lab-interior',
      publicId: 'local:lab-interior',
      url: '/images/lab_image.webp',
      format: 'webp',
      width: 228,
      height: 510,
      bytes: 31130,
      altText: 'Sun Path Lab Testing Room & Analyzers',
      caption: 'Testing equipment and clean clinical workspace',
    },
    {
      id: 'asset-reception',
      publicId: 'local:reception',
      url: '/images/reception.webp',
      format: 'webp',
      width: 382,
      height: 510,
      bytes: 36774,
      altText: 'Sun Path Lab Reception & Patient Registration Desk',
      caption: 'Welcoming reception desk at Russell Chowk, Jabalpur',
    },
  ];

  for (const asset of assets) {
    await db
      .insert(mediaAssets)
      .values({
        id: asset.id,
        publicId: asset.publicId,
        url: asset.url,
        format: asset.format,
        width: asset.width,
        height: asset.height,
        bytes: asset.bytes,
        altText: asset.altText,
        caption: asset.caption,
        createdAt: new Date(),
      })
      .onConflictDoUpdate({
        target: mediaAssets.id,
        set: {
          url: asset.url,
          altText: asset.altText,
          caption: asset.caption,
        },
      });
  }

  console.log('✅ Seeding completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
