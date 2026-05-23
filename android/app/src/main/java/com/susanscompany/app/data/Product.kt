package com.susanscompany.app.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Product(
    @SerialName("id")
    val id: Int,
    @SerialName("name")
    val name: String,
    @SerialName("price")
    val price: Double,
    @SerialName("discount_price")
    val discountPrice: Double? = null,
    @SerialName("category")
    val category: String, // "clothes" or "books"
    @SerialName("description")
    val description: String,
    @SerialName("whatsapp_message")
    val whatsappMessage: String,
    @SerialName("in_stock")
    val inStock: Boolean = true
)
