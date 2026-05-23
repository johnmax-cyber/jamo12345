package com.susanscompany.app.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Order(
    @SerialName("product_id")
    val productId: Int,
    @SerialName("product_name")
    val productName: String,
    @SerialName("status")
    val status: String = "pending"
)
