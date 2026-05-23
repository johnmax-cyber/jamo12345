package com.susanscompany.app.network

import com.susanscompany.app.data.Order
import com.susanscompany.app.data.Product
import io.github.jan-tennert.supabase.createSupabaseClient
import io.github.jan-tennert.supabase.postgrest.Postgrest
import io.github.jan-tennert.supabase.postgrest.postgrest

object SupabaseClient {

    private const val SUPABASE_URL = "https://kyknrxolzctljahlegsc.supabase.co"
    private const val SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5a25yeG9semN0bGphaGxlZ3NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjIzNjcsImV4cCI6MjA5NDQzODM2N30.KoJM7dKRtTwOiWIT5VmVpeNqSGJOIts2qQhWsAYoWJM"

    val client = createSupabaseClient(
        supabaseUrl = SUPABASE_URL,
        supabaseKey = SUPABASE_ANON_KEY
    ) {
        install(Postgrest)
    }

    /**
     * Fetch products from Supabase.
     * Supports search filter, category filter, and offset-based pagination.
     */
    suspend fun fetchProducts(
        category: String? = null,
        searchQuery: String? = null,
        onlySale: Boolean = false,
        limit: Long = 12,
        offset: Long = 0
    ): List<Product> {
        return client.postgrest["products"].select {
            filter {
                if (!category.isNullOrBlank()) {
                    eq("category", category)
                }
                if (!searchQuery.isNullOrBlank()) {
                    ilike("name", "%$searchQuery%")
                }
                if (onlySale) {
                    gt("discount_price", 0)
                }
            }
            // Set limit and offset using Postgrest range
            range(offset, offset + limit - 1)
        }.decodeList<Product>()
    }

    /**
     * Submit an order to official orders table.
     */
    suspend fun createOrder(order: Order) {
        client.postgrest["orders"].insert(order)
    }
}
