import { siteConfig } from '../config/site';

export function generateLocalBusinessSchema(settings?: any) {
  const phone = settings?.primaryPhone || siteConfig.contact.primaryPhone;
  const address = settings?.address || siteConfig.address.street;
  const siteUrl = siteConfig.url;

  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    '@id': `${siteUrl}/#organization`,
    name: settings?.siteName || siteConfig.name,
    alternateName: siteConfig.hindiName,
    url: siteUrl,
    logo: `${siteUrl}/images/logo.jpeg`,
    image: [
      `${siteUrl}/images/logo.jpeg`,
      `${siteUrl}/images/reception.webp`,
      `${siteUrl}/images/lab_image.webp`,
    ],
    telephone: `+91${phone.replace(/[^0-9]/g, '').slice(-10)}`,
    priceRange: '₹₹',
    medicalSpecialty: 'Pathology',
    address: {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressLocality: 'Jabalpur',
      addressRegion: 'Madhya Pradesh',
      postalCode: '482001',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '23.1686', // Russell Chowk coordinates
      longitude: '79.9339',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '07:30',
        closes: '22:00',
      },
    ],
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteConfig.url}${item.url}`,
    })),
  };
}

export function generatePackageSchema(pkg: any) {
  const siteUrl = siteConfig.url;
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalTest',
    name: pkg.name,
    description: pkg.description,
    url: `${siteUrl}/packages/${pkg.slug}`,
    usedToDiagnose: pkg.tests || [],
    offers: {
      '@type': 'Offer',
      price: pkg.discountPrice || pkg.regularPrice || '0.00',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'MedicalBusiness',
        name: siteConfig.name,
      },
    },
  };
}
