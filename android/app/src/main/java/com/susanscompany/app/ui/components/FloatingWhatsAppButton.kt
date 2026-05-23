package com.susanscompany.app.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Forum
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.susanscompany.app.ui.theme.WhatsAppGreen

@Composable
fun FloatingWhatsAppButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    FloatingActionButton(
        onClick = onClick,
        containerColor = WhatsAppGreen,
        contentColor = Color.White,
        shape = CircleShape,
        modifier = modifier
            .size(56.dp)
    ) {
        Icon(
            imageVector = Icons.Default.Forum,
            contentDescription = "WhatsApp Susan's Company",
            modifier = Modifier.size(28.dp),
            tint = Color.White
        )
    }
}
