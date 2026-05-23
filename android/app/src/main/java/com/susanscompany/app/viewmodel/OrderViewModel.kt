package com.susanscompany.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.susanscompany.app.data.Order
import com.susanscompany.app.data.Product
import com.susanscompany.app.network.SupabaseClient
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface OrderUiState {
    object Idle : OrderUiState
    object Loading : OrderUiState
    data class Success(val whatsappMessage: String, val productName: String) : OrderUiState
    data class Error(val errorMsg: String) : OrderUiState
}

class OrderViewModel : ViewModel() {

    private val _orderState = MutableStateFlow<OrderUiState>(OrderUiState.Idle)
    val orderState: StateFlow<OrderUiState> = _orderState.asStateFlow()

    /**
     * Resets order placing state back to Idle
     */
    fun resetOrderState() {
        _orderState.value = OrderUiState.Idle
    }

    /**
     * Place order in Supabase and notify observer.
     */
    fun placeOrder(product: Product) {
        viewModelScope.launch {
            _orderState.value = OrderUiState.Loading
            try {
                val orderRequest = Order(
                    productId = product.id,
                    productName = product.name,
                    status = "pending"
                )
                // Insert into Supabase 'orders' list
                SupabaseClient.createOrder(orderRequest)
                
                // Emits Success carrying pre-formatted WhatsApp text
                _orderState.value = OrderUiState.Success(
                    whatsappMessage = product.whatsappMessage,
                    productName = product.name
                )
            } catch (e: Exception) {
                _orderState.value = OrderUiState.Error(
                    errorMsg = e.message ?: "Failed to record order: Service is briefly busy."
                )
            }
        }
    }
}
