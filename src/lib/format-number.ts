export function toHumanReadable(number: any, decPlaces: number = 2): string {
    if (number == 0) {
        return "-";
    }
    if (number < 0.01) {
        return ">0.01";
    }
    // 2 decimal places => 100, 3 => 1000, etc

    const decimalPlaces = decPlaces;
    decPlaces = Math.pow(10, decPlaces);

    // Enumerate number abbreviations
    let abbrev = ["K", "M", "B", "T"];

    let isToSmall = true;
    // Go through the array backwards, so we do the largest first
    for (let i = abbrev.length - 1; i >= 0; i--) {

        // Convert array index to "1000", "1000000", etc
        let size = Math.pow(10, (i + 1) * 3);

        // If the number is bigger or equal do the abbreviation
        if (size <= number) {
            // Here, we multiply by decPlaces, round, and then divide by decPlaces.
            // This gives us nice rounding to a particular decimal place.
            number = Math.round(number * decPlaces / size) / decPlaces;

            // Handle special case where we round up to the next abbreviation
            if ((number == 1000) && (i < abbrev.length - 1)) {
                number = 1;
                i++;
            }

            // Add the letter for the abbreviation
            number += abbrev[i];

            // We are done... stop
            isToSmall = false;
            break;
        }
    }

    if (isToSmall) {
        return formatNumberFloor(number, decimalPlaces);
    }

    return number.toString();
}

function formatNumberFloor(x, dec) {
    // convert it to a string
    var s = "" + x;
    // if x is integer, the point is missing, so add it
    if (s.indexOf(".") == -1) {
        s += ".";
    }
    // make sure if we have at least 2 decimals
    s += "00";
    // get the first 2 decimals
    return s.substring(0, s.indexOf(".") + 1 + dec);
}
