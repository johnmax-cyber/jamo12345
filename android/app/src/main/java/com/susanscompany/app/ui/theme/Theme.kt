package com.susanscompany.app.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = ForestGreen,
    secondary = WarmGold,
    tertiary = DarkGreenOverlay,
    background = SoftGrey,
    surface = PerfectWhite,
    onPrimary = PerfectWhite,
    onSecondary = DarkCharcoal,
    onBackground = DarkCharcoal,
    onSurface = DarkCharcoal
)

private val DarkColorScheme = darkColorScheme(
    primary = ForestGreen,
    secondary = WarmGold,
    tertiary = SoftGrey,
    background = DarkCharcoal,
    surface = Color(0xFF262626),
    onPrimary = PerfectWhite,
    onSecondary = PerfectWhite,
    onBackground = PerfectWhite,
    onSurface = PerfectWhite
)

@Composable
fun SusansCompanyTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = ForestGreen.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
