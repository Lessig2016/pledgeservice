function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

$(function(){
	prepPost();
});


var prepPost = function(){
	var amount = getParameterByName('amount');
	var recurring = getParameterByName('recurring');
	var receipt = getParameterByName('receipt');
	console.log(amount);

	$('#pledge_amount').text(amount);
	$('.do-close-askagain').click(function(){
		$('#ask-again-popup').fadeOut();
	});
//	$('#post-pledge-data').append('Donated: '+amount);
//	$('#post-pledge-data').append( $("<br />") );
//	$('#post-pledge-data').append('Recurring: '+recurring);
// 	$('#post-pledge-data').append( $("<br />") );
//	$('#post-pledge-data').append('Receipt ID: ' + receipt);	

console.log(recurring);
};

var stateList = {
    "AL": "https://groups.google.com/d/forum/teamlessigAL",
    "AK": "https://groups.google.com/d/forum/teamlessigAK",
    "AS": "https://groups.google.com/d/forum/teamlessigAS",
    "AZ": "https://groups.google.com/d/forum/teamlessigAZ",
    "AR": "https://groups.google.com/d/forum/teamlessigAR",
    "CA": "https://groups.google.com/d/forum/teamlessigCA",
    "CO": "https://groups.google.com/d/forum/teamlessigCO",
    "CT": "https://groups.google.com/d/forum/teamlessigCT",
    "DE": "https://groups.google.com/d/forum/teamlessigDE",
    "DC": "https://groups.google.com/d/forum/teamlessigDC",
    "FM": "Federated States Of Micronesia",
    "FL": "https://groups.google.com/d/forum/teamlessigFL",
    "GA": "https://groups.google.com/d/forum/teamlessigGA",
    "GU": "https://groups.google.com/d/forum/teamlessigGU",
    "HI": "https://groups.google.com/d/forum/teamlessigHI",
    "ID": "https://groups.google.com/d/forum/teamlessigID",
    "IL": "https://groups.google.com/d/forum/teamlessigIL",
    "IN": "https://groups.google.com/d/forum/teamlessigIN",
    "IA": "https://groups.google.com/d/forum/teamlessigIA",
    "KS": "https://groups.google.com/d/forum/teamlessigKS",
    "KY": "https://groups.google.com/d/forum/teamlessigKY",
    "LA": "https://groups.google.com/d/forum/teamlessigLA",
    "ME": "https://groups.google.com/d/forum/teamlessigME",
    "MH": "Marshall Islands",
    "MD": "https://groups.google.com/d/forum/teamlessigMD",
    "MA": "https://groups.google.com/d/forum/teamlessigMA",
    "MI": "https://groups.google.com/d/forum/teamlessigMI",
    "MN": "https://groups.google.com/d/forum/teamlessigMN",
    "MS": "https://groups.google.com/d/forum/teamlessigMS",
    "MO": "https://groups.google.com/d/forum/teamlessigMO",
    "MT": "https://groups.google.com/d/forum/teamlessigMT",
    "NE": "https://groups.google.com/d/forum/teamlessigNE",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "MP": "Northern Mariana Islands",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PW": "Palau",
    "PA": "Pennsylvania",
    "PR": "Puerto Rico",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VI": "Virgin Islands",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
};

