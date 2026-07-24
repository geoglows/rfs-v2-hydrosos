import Plotly from "plotly.js-dist-min";
import { buildHydroSOSForecast } from "../utils/buildHydroSOSForecast";


export function plotHydroSOSBands(
    bands,
    currentYearMonthly
) {

    const monthNames = [
        "Jan","Feb","Mar",
        "Apr","May","Jun",
        "Jul","Aug","Sep",
        "Oct","Nov","Dec"
    ];
    
    const months = bands.map(
        b => monthNames[b.month - 1]
    );

    const p10 = bands.map(b => b.p10);
    const p25 = bands.map(b => b.p25);
    const p75 = bands.map(b => b.p75);
    const p90 = bands.map(b => b.p90);
    const p99 = bands.map(b => b.p99);

    console.table(
        bands.map((b, i) => ({
            month: b.month,
            p10: b.p10,
            p25: b.p25,
            p75: b.p75,
            p90: b.p90
        }))
    );
    
    console.log(currentYearMonthly);

    const forecast =
    buildHydroSOSForecast(
        bands,
        currentYearMonthly
    );

    
    const traces = [];


    // Very Dry boundary
    traces.push({

        x: months,
        y: p10,
    
        mode: "lines",
    
        fill: "tozeroy",
    
        fillcolor:
            "rgba(180,0,0,0.25)",
    
        line:{
            width:0
        },
    
        name:"Very Dry",
        hoverinfo: "skip"
    
    });
    


    // Dry
    traces.push({

        x: months,
        y: p25,
    
        mode:"lines",
    
        fill:"tonexty",
    
        fillcolor:
            "rgba(255,165,0,0.35)",
    
        line:{
            width:0
        },

        hoverinfo: "skip",
    
        name:"Dry"
    
    });


    // Normal

    traces.push({

        x: months,
        y:p75,
    
        mode:"lines",
    
        fill:"tonexty",
    
        fillcolor:
            "rgba(150,150,150,0.25)",
    
        line:{
            width:0
        },

        hoverinfo: "skip",
    
        name:"Normal"
    
    });



    // Wet

    traces.push({

        x: months,
        y:p90,
    
        mode:"lines",
    
        fill:"tonexty",
    
        fillcolor:
            "rgba(0,150,255,0.35)",
    
        line:{
            width:0
        },

        hoverinfo: "skip",
    
        name:"Wet"
    
    });

    // Very Wet
    traces.push({

        x: months,
        y:p99,
    
        mode:"lines",
    
        fill:"tonexty",
    
        fillcolor:
            "rgba(0,80,200,0.35)",
    
        line:{
            width:0
        },

        hoverinfo: "skip",
    
        name:"Very Wet"
    
    });



    // Current year

    traces.push({

        x: months,

        y: currentYearMonthly,

        mode:
            "lines+markers",

        name:
            "Current Year",

        line:{
            color:"black",
            width:4
        },

        marker:{
            size:8
        },
        hovertemplate:
        "<b>Current Year:</b><br>" +
        "%{y:.0f} m³/s" +
        "<extra></extra>"

    });

    traces.push({

        x: months,
    
        y: forecast.maximum,
    
        mode: "lines",
    
        line: {
            color: "gray",
            dash: "dot"
        },
    
        name: "Historical Maximum",
    
        hovertemplate:
            "<b>Historical Maximum</b><br>" +
            "%{y:.0f} m³/s" +
            "<extra></extra>"
    
    });

    traces.push({

        x: months,
    
        y: forecast.minimum,
    
        mode: "lines",
    
        line: {
            color: "gray",
            dash: "dot"
        },
    
        fill: "tonexty",
    
        fillcolor: "rgba(180,180,180,.2)",
    
        name: "Historical Minimum",
    
        hovertemplate:
            "<b>Historical Minimum</b><br>" +
            "%{y:.0f} m³/s" +
            "<extra></extra>"
    
    });

    traces.push({

        x: months,
    
        y: forecast.median,
    
        mode: "lines+markers",
    
        line: {
            color: "#1f77b4",
            dash: "dash",
            width: 3
        },
    
        marker: {
            size: 7
        },
    
        name: "Median Forecast",
    
        hovertemplate:
            "<b>Median Forecast</b><br>" +
            "%{y:.0f} m³/s" +
            "<extra></extra>"
    
    });


    const layout = {

        title: {
            text: "HydroSOS Monthly Flow Status"
        },

        hovermode: "x unified",
    
        xaxis: {
            title: {
                text: "Month"
            }
        },
    
        yaxis: {
            title: {
                text: "Mean Monthly Flow (m³/s)"
            }
        },
    
        showlegend: true
    
    };

    Plotly.newPlot(

        "hydrosos-bands",

        traces,

        layout

    );

}