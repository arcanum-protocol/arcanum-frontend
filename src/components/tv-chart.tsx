import { useEffect, useRef } from 'react';
import {
    widget,
    ChartingLibraryWidgetOptions,
    LanguageCode,
    ResolutionString,
    ChartingLibraryFeatureset,
} from '../lib/charting_library';
import * as React from 'react';
import { useMobileMedia } from '../hooks/tokens';

export const SUPPORTED_RESOLUTIONS = { 1: "1m", 3: "3m", 5: "5m", 15: "15m", 30: "30m", 60: "1h", 720: "12h", "1D": "1d" };

const RED = "#fa3c58";
const GREEN = "#0ecc83";
export const DEFAULT_PERIOD = "12h";

const chartStyleOverrides = ["candleStyle", "hollowCandleStyle", "haStyle"].reduce((acc, cv) => {
    acc[`mainSeriesProperties.${cv}.drawWick`] = true;
    acc[`mainSeriesProperties.${cv}.drawBorder`] = false;
    acc[`mainSeriesProperties.${cv}.upColor`] = GREEN;
    acc[`mainSeriesProperties.${cv}.downColor`] = RED;
    acc[`mainSeriesProperties.${cv}.wickUpColor`] = GREEN;
    acc[`mainSeriesProperties.${cv}.wickDownColor`] = RED;
    acc[`mainSeriesProperties.${cv}.borderUpColor`] = GREEN;
    acc[`mainSeriesProperties.${cv}.borderDownColor`] = RED;
    return acc;
}, {});

const chartOverrides = {
    "paneProperties.background": "rgba(30, 29, 29, 0.8)",
    "paneProperties.backgroundGradientStartColor": "#4D4D4D",
    "paneProperties.backgroundGradientEndColor": "#4D4D4D",
    "paneProperties.backgroundType": "solid",
    "paneProperties.vertGridProperties.color": "#4D4D4D",
    "paneProperties.vertGridProperties.style": 2,
    "paneProperties.horzGridProperties.color": "#4D4D4D",
    "paneProperties.horzGridProperties.style": 2,
    "mainSeriesProperties.priceLineColor": "#4D4D4D",
    "scalesProperties.textColor": "#4D4D4D",
    "scalesProperties.lineColor": "#4D4D4D",
    ...chartStyleOverrides,
};

export const disabledFeaturesOnMobile = ["header_saveload", "header_fullscreen_button"];

export const defaultChartProps = {
    theme: "Dark",
    locale: "en",
    library_path: "/charting_library/",
    clientId: "tradingview.com",
    userId: "public_user_id",
    fullscreen: false,
    autosize: true,
    header_widget_dom_node: false,
    overrides: chartOverrides,
    custom_css_url: "/tradingview-chart.css",
    loading_screen: { backgroundColor: "#16182e", foregroundColor: "#2962ff" },
    favorites: { 3: "3m", },
};

export interface ChartContainerProps {
    symbol: ChartingLibraryWidgetOptions['symbol'];
    interval: ChartingLibraryWidgetOptions['interval'];

    // BEWARE: no trailing slash is expected in feed URL
    datafeedUrl: string;
    libraryPath: ChartingLibraryWidgetOptions['library_path'];
    chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url'];
    chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version'];
    clientId: ChartingLibraryWidgetOptions['client_id'];
    userId: ChartingLibraryWidgetOptions['user_id'];
    fullscreen: ChartingLibraryWidgetOptions['fullscreen'];
    autosize: ChartingLibraryWidgetOptions['autosize'];
    studiesOverrides: ChartingLibraryWidgetOptions['studies_overrides'];
    container: ChartingLibraryWidgetOptions['container'];
}

const getLanguageFromURL = (): LanguageCode | null => {
    const regex = new RegExp('[\\?&]lang=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' ')) as LanguageCode;
};

export const TVChartContainer = React.memo(({ symbol, datafeedUrl = 'https://api.arcanum.to/api/tv' }) => {
    const chartContainerRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;

    const isMobile = useMobileMedia();

    useEffect(() => {
        const widgetOptions: ChartingLibraryWidgetOptions = {
            theme: "dark",
            symbol: symbol as string,
            datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed(datafeedUrl),
            interval: 15 as ChartingLibraryWidgetOptions['interval'],
            container: chartContainerRef.current,
            library_path: defaultChartProps.library_path as string,

            locale: 'en',
            enabled_features: [
                "side_toolbar_in_fullscreen_mode",
                "header_in_fullscreen_mode",
                "hide_resolution_in_legend",
                "items_favoriting",
                "hide_left_toolbar_by_default",
            ],
            client_id: defaultChartProps.clientId,
            disabled_features: [
                "volume_force_overlay",
                "show_logo_on_all_charts",
                "caption_buttons_text_if_possible",
                "create_volume_indicator_by_default",
                "header_compare",
                "compare_symbol",
                "display_market_status",
                "header_interval_dialog_button",
                "show_interval_dialog_on_key_press",
                "header_symbol_search",
                "popup_hints",
                "header_in_fullscreen_mode",
                "use_localstorage_for_settings",
                "right_bar_stays_on_scroll",
                "symbol_info",
            ].concat(isMobile ? disabledFeaturesOnMobile : []),
            user_id: defaultChartProps.userId,
            custom_css_url: '/tradingview-chart.css',
            fullscreen: false,
            autosize: true,
            //custom_font_family: 'Ubuntu',
            overrides: defaultChartProps.overrides,
            favorites: {
                ...defaultChartProps.favorites, intervals: [15, 720, "1D"] //Object.keys(SUPPORTED_RESOLUTIONS)
            },
            //custom_formatters: defaultChartProps.custom_formatters,
        };

        const tvWidget = new widget(widgetOptions);

        tvWidget.onChartReady(() => {
            tvWidget.headerReady().then(() => {
                const button = tvWidget.createButton();
                button.setAttribute('title', 'Click to show a notification popup');
                button.classList.add('apply-common-tooltip');
                button.addEventListener('click', () => tvWidget.showNoticeDialog({
                    title: 'Notification',
                    body: 'TradingView Charting Library API works correctly',
                    callback: () => {
                        console.log('Noticed!');
                    },
                }));
                button.innerHTML = 'Check API';
            });
        });

        return () => {
            tvWidget.remove();
        };
    });

    return (
        <div
            style={{ width: "100%", height: "60vh", borderRadius: "10px" }}
            ref={chartContainerRef}
            className={'TVChartContainer'}
        />
    );
});

