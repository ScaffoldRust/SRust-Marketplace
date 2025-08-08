#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read environment variables
let envVars = {};
try {
    const envContent = readFileSync('.env.local', 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            envVars[key.trim()] = value.trim();
        }
    });
} catch (error) {
    console.error('❌ Cannot read .env.local file');
    process.exit(1);
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
}

// Initialize Supabase admin client
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');

        // First, let's check if tables exist
        console.log('🔍 Checking database tables...');
        const { data: tables, error: tableError } = await adminClient
            .from('categories')
            .select('count', { count: 'exact', head: true });

        if (tableError) {
            console.error('❌ Database tables not ready:', tableError);
            throw tableError;
        }

        console.log('✅ Database tables are ready');

        // Create categories
        const categories = [
            { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and accessories' },
            { name: 'Clothing', slug: 'clothing', description: 'Apparel and fashion items' },
            { name: 'Books', slug: 'books', description: 'Physical and digital books' },
            { name: 'Art', slug: 'art', description: 'Artwork and creative pieces' },
            { name: 'Home & Garden', slug: 'home-garden', description: 'Home improvement and gardening items' },
            { name: 'Sports', slug: 'sports', description: 'Sports equipment and accessories' }
        ];

        console.log('📂 Creating categories...');
        
        // Check if categories already exist
        const { data: existingCategories } = await adminClient
            .from('categories')
            .select('*');

        let insertedCategories = existingCategories || [];

        if (!existingCategories || existingCategories.length === 0) {
            const { data: newCategories, error: categoryError } = await adminClient
                .from('categories')
                .insert(categories)
                .select();

            if (categoryError) {
                console.error('❌ Error creating categories:', categoryError);
                throw categoryError;
            }
            insertedCategories = newCategories;
        }

        console.log(`✅ Categories ready: ${insertedCategories.length}`);

        // Create sample products with a mock seller ID
        const mockSellerId = '00000000-0000-0000-0000-000000000001'; // Mock UUID

        const products = [
            {
                title: 'Wireless Bluetooth Headphones',
                description: 'High-quality wireless headphones with noise cancellation',
                price: 99.99,
                category: insertedCategories.find(c => c.slug === 'electronics')?.id,
                seller_id: null,
                stock: 50,
                slug: 'wireless-bluetooth-headphones-001',
                featured: true,
                rating: 4.5,
                rating_count: 128
            },
            {
                title: 'Organic Cotton T-Shirt',
                description: 'Comfortable organic cotton t-shirt in various colors',
                price: 24.99,
                category: insertedCategories.find(c => c.slug === 'clothing')?.id,
                seller_id: null,
                stock: 100,
                slug: 'organic-cotton-tshirt-002',
                featured: false,
                rating: 4.2,
                rating_count: 45
            },
            {
                title: 'JavaScript Programming Guide',
                description: 'Complete guide to modern JavaScript programming',
                price: 39.99,
                category: insertedCategories.find(c => c.slug === 'books')?.id,
                seller_id: null,
                stock: 25,
                slug: 'javascript-programming-guide-003',
                featured: true,
                rating: 4.8,
                rating_count: 89
            },
            {
                title: 'Abstract Canvas Art',
                description: 'Beautiful abstract painting on canvas',
                price: 149.99,
                category: insertedCategories.find(c => c.slug === 'art')?.id,
                seller_id: null,
                stock: 5,
                slug: 'abstract-canvas-art-004',
                featured: false,
                rating: 4.7,
                rating_count: 12
            },
            {
                title: 'Smart Home Thermostat',
                description: 'WiFi-enabled programmable thermostat',
                price: 199.99,
                category: insertedCategories.find(c => c.slug === 'home-garden')?.id,
                seller_id: null,
                stock: 30,
                slug: 'smart-home-thermostat-005',
                featured: true,
                rating: 4.6,
                rating_count: 67
            },
            {
                title: 'Professional Tennis Racket',
                description: 'High-performance tennis racket for serious players',
                price: 89.99,
                category: insertedCategories.find(c => c.slug === 'sports')?.id,
                seller_id: null,
                stock: 15,
                slug: 'professional-tennis-racket-006',
                featured: false,
                rating: 4.4,
                rating_count: 34
            }
        ];

        console.log('🛍️ Creating sample products...');
        
        // Check if products already exist
        const { data: existingProducts } = await adminClient
            .from('products')
            .select('*');

        let insertedProducts = existingProducts || [];

        if (!existingProducts || existingProducts.length === 0) {
            const { data: newProducts, error: productError } = await adminClient
                .from('products')
                .insert(products)
                .select();

            if (productError) {
                console.error('❌ Error creating products:', productError);
                throw productError;
            }
            insertedProducts = newProducts;
        }

        console.log(`✅ Products ready: ${insertedProducts.length}`);

        // Create product images
        const { data: existingImages } = await adminClient
            .from('product_images')
            .select('*');

        if (!existingImages || existingImages.length === 0) {
            const productImages = insertedProducts.flatMap(product => [
                {
                    product_id: product.id,
                    url: `https://via.placeholder.com/600x600/4F46E5/FFFFFF?text=${encodeURIComponent(product.title)}`,
                    alt_text: `${product.title} - Main Image`,
                    display_order: 0,
                    is_primary: true
                },
                {
                    product_id: product.id,
                    url: `https://via.placeholder.com/600x600/7C3AED/FFFFFF?text=${encodeURIComponent(product.title + ' Alt')}`,
                    alt_text: `${product.title} - Alternative View`,
                    display_order: 1,
                    is_primary: false
                }
            ]);

            console.log('🖼️ Creating product images...');
            const { error: imageError } = await adminClient
                .from('product_images')
                .insert(productImages);

            if (imageError) {
                console.error('❌ Error creating product images:', imageError);
                throw imageError;
            }

            console.log(`✅ Created ${productImages.length} product images`);
        } else {
            console.log(`✅ Product images already exist: ${existingImages.length}`);
        }

        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   Categories: ${insertedCategories.length}`);
        console.log(`   Products: ${insertedProducts.length}`);
        console.log('\n✨ Your database is now populated with sample data!');

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
}

seedDatabase();