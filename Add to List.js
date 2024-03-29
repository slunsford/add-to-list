// Add to List

// User values (editable)
const defaultBullet = "-"         // Alternatives: * or +
const defaultChecklist = "- [ ]"  // Alternatives: "* [ ]" or "+ [ ]"
const listTag = "lists"           // Alternatives: ¯\_(ツ)_/¯ (whatever you want it to be)

var selectDraft = function() {
	var drafts = Draft.query("", "inbox", [listTag]).reverse()  // Get all list drafts newest to oldest
	var titles = drafts.map(function(d) { return d.title })     // Get titles of all drafts
		
	var p = Prompt.create()
	p.title = "Select List"
	for (t of titles) {
		p.addButton(t)
	}
	const newListButton = "+ New List…"
	p.addButton(newListButton)
	var didSelect = p.show()
	
	if (didSelect) {
		if (p.buttonPressed == newListButton) {
			return newList()
		}
		else {
			return drafts[titles.indexOf(p.buttonPressed)]  // Return selected draft
		}
	}
	else {
		return false
	}
}

var newList = function() {
	// Prompt for title
	var p = Prompt.create()
	p.title = "New List"
	p.addTextField("title", "", "", { "placeholder": "Title", "autocapitalization": "sentences" })
	p.addButton("Create")
	var didCreate = p.show()
	
	if (didCreate) {
		// Create draft with given title
		var d = Draft.create()
		d.content = "# " + p.fieldValues["title"] + "\n"
		d.addTag(listTag)
		d.update()
		return d
	}
	else {
		return false
	}
}

var selectListType = function() {	
	// Prompt for list style
	p = Prompt.create()
	p.title = "Select List Type"
	p.addButton(defaultBullet + " Bulleted")
	p.addButton("1. Numbered")
	p.addButton(defaultChecklist + " Checklist")
	var didSelect = p.show()
	
	if (didSelect) {
		var b = p.buttonPressed.match(/^.+(?= [a-z]+$)/i)[0]  // Extract bullet from selection
		if (b == "1.") { b = "0." }                           // Set up for addBullet() function
		return b
	}
	else {
		return false
	}
}

var addBullet = function(text, index) {
	var indent = text.match(/^[\t ]*/)    // Get leading whitespace
	var n = parseFloat(bullet)            // Get numeral if numbered list
	if (n || bullet == "0.") {            // Include condition where new numbered list created
		n += index + 1                     // Iterate numeral by one
		return indent + n + ". " + text.trim()
	}
	else {
		return indent + bullet.replace("[x]","[ ]") + " " + text.trim()  // Replace checked box with empty box
	}
}

const bulletRegex = /^([\t ]*)([-*+]( \[( |x)\])?|\d+\.)/gm
var bullet = ""
var d = selectDraft()

if (d) {
	var matches = d.content.match(bulletRegex)
	if (matches) {  // No bullets found
		bullet = matches.reverse()[0].trim()
	}
	else {
		bullet = selectListType()
	}
	console.log(bullet)
	if (bullet) {
		var text = draft.content.trim()       // Remove white space on either end
		text = text.replace(bulletRegex,"$1")   // Strip existing bullets but leave indentation
		var lines = text.split("\n")
		lines = lines.map(addBullet)
		d.content += "\n" + lines.join("\n")  // Join and append to draft
		d.update()
		editor.load(d)  // Open list
	}
	else {
		context.cancel()
	}
}
else {
	context.cancel()
}