import axios from "axios";
import https from "https";
import {storage} from "../../storage";

export class WooCommerceService {
  static async verifyConnection(
    storeUrl: string,
    consumerKey: string,
    consumerSecret: string
  ) {
    const isLocalDev = storeUrl.includes(".local");

    const { data } = await axios.get(
      `${storeUrl}/wp-json/wc/v3/system_status`,
      {
        auth: {
          username: consumerKey.trim(),
          password: consumerSecret.trim(),
        },
        httpsAgent: isLocalDev
          ? new https.Agent({ rejectUnauthorized: false })
          : undefined,
      }
    );

    return data;
  }





  static async getCustomers(
  storeUrl: string,
  consumerKey: string,
  consumerSecret: string
) {
  const isLocalDev = storeUrl.includes(".local");

  const customers: any[] = [];
  let page = 1;

  while (true) {
    const { data } = await axios.get(
      `${storeUrl}/wp-json/wc/v3/customers`,
      {
        auth: {
          username: consumerKey.trim(),
          password: consumerSecret.trim(),
        },
        params: {
          per_page: 100,
          page,
        },
        httpsAgent: isLocalDev
          ? new https.Agent({
              rejectUnauthorized: false,
            })
          : undefined,
      }
    );

    if (!data.length) break;

    customers.push(...data);
    page++;
  }

  return customers;
}



static async syncCustomers(
  store: any
) {
  const customers = await this.getCustomers(
    store.storeUrl,
    store.consumerKey,
    store.consumerSecret
  );

  let imported = 0;
  let skipped = 0;

  for (const customer of customers) {
    const phone = customer.billing?.phone?.trim();

    if (!phone) {
      skipped++;
      continue;
    }

    await storage.findOrCreateContact({
      channelId: store.channelId,
      storeId: store.id,
      phone,
      email: customer.email || "",
      name: `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),
      createdBy: store.userId,
      externalId: String(customer.id),
      source: "woocommerce",
    });

    imported++;
  }

  return {
    total: customers.length,
    imported,
    skipped,
  };
}




static async syncProducts(store: any) {
  const products = await this.getProducts(
    store.storeUrl,
    store.consumerKey,
    store.consumerSecret
  );

  let created = 0;
  let updated = 0;

  for (const product of products) {
    const existing = await storage.getEcommerceProductByExternalId(
      store.id,
      String(product.id)
    );

    const productData = {
      storeId: store.id,
      channelId: store.channelId,
      platform: "woocommerce",
      externalProductId: String(product.id),
      title: product.name,
      description: product.description || null,
      price: product.price || "0",
      currency: product.currency || "INR",
      imageUrl: product.images?.[0]?.src || null,
      productUrl: product.permalink || null,
      status: product.status === "publish" ? "active" : "inactive",
      metadata: {
        sku: product.sku || null,
        type: product.type,
        categories: product.categories || [],
        tags: product.tags || [],
        stockStatus: product.stock_status,
        stockQuantity: product.stock_quantity,
        regularPrice: product.regular_price,
        salePrice: product.sale_price,
        variations: product.variations || [],
      },
      lastSyncedAt: new Date(),
      updatedAt: new Date(),
    };

    if (existing) {
      await storage.updateEcommerceProduct(existing.id, productData);
      updated++;
    } else {
      await storage.createEcommerceProduct({
        ...productData,
        createdAt: new Date(),
      });
      created++;
    }
  }

  return {
    total: products.length,
    created,
    updated,
  };
}


static async getProducts(
  storeUrl: string,
  consumerKey: string,
  consumerSecret: string
) {
  const isLocalDev = storeUrl.includes(".local");

  const products: any[] = [];
  let page = 1;

  while (true) {
    const { data } = await axios.get(
      `${storeUrl}/wp-json/wc/v3/products`,
      {
        auth: {
          username: consumerKey.trim(),
          password: consumerSecret.trim(),
        },
        params: {
          per_page: 100,
          page,
        },
        httpsAgent: isLocalDev
          ? new https.Agent({
              rejectUnauthorized: false,
            })
          : undefined,
      }
    );

    if (!data.length) break;

    products.push(...data);
    page++;
  }

  return products;
}
}