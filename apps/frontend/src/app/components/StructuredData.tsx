import React from 'react';

interface ProductStructuredDataProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    rating?: number;
  };
  url: string;
}

export const ProductStructuredData: React.FC<ProductStructuredDataProps> = ({ product, url }) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: `${process.env.NEXT_PUBLIC_APP_URL || 'https://srust-marketplace.com'}${product.image}`,
    sku: `SRUST-${product.id}`,
    mpn: `SRUST-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: 'SRust Marketplace',
    },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://srust-marketplace.com'}${url}`,
      priceCurrency: 'USD',
      price: product.price,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'SRust Marketplace',
      },
    },
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: Math.floor(product.rating * 10), // Simulated review count
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

interface WebsiteStructuredDataProps {
  siteUrl: string;
}

export const WebsiteStructuredData: React.FC<WebsiteStructuredDataProps> = ({ siteUrl }) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SRust Marketplace',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/marketplace?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export const OrganizationStructuredData: React.FC = () => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SRust Marketplace',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://srust-marketplace.com',
    logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://srust-marketplace.com'}/logo.png`,
    sameAs: [
      'https://twitter.com/srustmarketplace',
      'https://github.com/srust-marketplace',
      'https://discord.gg/srust-marketplace',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-555-5555',
      contactType: 'customer service',
      email: 'support@srust-marketplace.com',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export const BreadcrumbStructuredData: React.FC<{ items: { name: string; url: string }[] }> = ({
  items,
}) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://srust-marketplace.com'}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};
