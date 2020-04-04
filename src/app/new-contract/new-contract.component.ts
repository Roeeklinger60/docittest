import { Component, OnInit , ChangeDetectionStrategy} from '@angular/core';
import { formatDate } from '@angular/common'
import * as Papa from 'papaparse/papaparse.min.js';

import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';


function get_variable_by_name(name, dict): any {
  for (let i = 0; i < Object.keys(dict).length; i++) {
    var section = Object.keys(dict)[i]
    for (let j = 0; j < dict[section].length; j++) {
      var variable = dict[section][j]
      if (variable.name == name) {
        return variable
      }
    }
  }  
  console.log(name, 'cant find variable!')


}

export class InputVariable {
  section: string
  name: string
  initialized = false
  value: any
  type: string
  question: string
  dict: any

  constructor(){}

  render_variable_left() : any {
    if (this.type == 'str') {
      if (this.value == ''){
        return "__________"
      }
      else{
        return this.value
      }  
    }

    if (this.type ==  "check box + two text") {
      if (this.value[0]){
        return this.value[1]
      }
      else{
        return this.value[2]
      }  
    }

    if (this.type ==  "date") {
      return formatDate(this.value, 'dd/MM/yyyy', 'en-US')
    }

    if (this.type ==  "date-diff") {
      var date_a_str = this.value[0]
      var date_b_str = this.value[1]

      var date_a = get_variable_by_name(date_a_str, this.dict).value
      var date_b = get_variable_by_name(date_b_str, this.dict).value
      var a_value = new Date(date_a).getTime()
      var b_value = new Date(date_b).getTime()

      return (b_value - a_value)/(1000*60*60*24)
      }

    if (this.type ==  "drop") {
      return this.value[this.value[0]].left
    }

    }

  render_variable_right() : any {
    if (this.question == 'None') {
      return ""
    }
    return this.question
  }

  init_var(data, dict) : any {
    this.section = data[0]
    this.name = data[1]
    this.type = data[2]
    this.question = data[3]
    this.dict = dict

    let result_drop = this.type.match("drop\\s(\\d*)");


    if (this.type == 'str') {
      this.value = ''
    }

    else if (this.type == 'date') {
      this.value = new Date();
    }

    else if (this.type ==  "check box + two text") {
      this.value = []
      this.value.push(false)
      this.value.push(data[4])
      this.value.push(data[5])
    }

    else if (this.type ==  "date-diff") {
      this.value = []
      this.value.push(data[4])
      this.value.push(data[5])
      return 0
    }

    else if (result_drop != null) {
      this.type = 'drop'
      this.value = []
      this.value.push(1)
      this.value.push({index: 1, 'right': "", 'left': "____"})
      var start_index = 4
      let k = Number(result_drop[1])
      for (let i = 0; i < k; i++) {
          this.value.push({index: i+2, 'right': data[start_index + 2*i], 'left': data[start_index + 2*i + 1]});
        }
      }
    }

  check_box_change() : any {
    this.value = !this.value
  }

  set_date(event): any {
    this.value = new Date(event)
    return this.value.toDateString()
  }
  
}


export class Clause{

  section: string
  raw_data: any
  dict: any

  title =  false
  free = false
  free_dict: any

init_clause(raw_data, dict) : any {
  this.section = raw_data[0]

  if (raw_data[2] == 'title') {
    this.title = true
  }
  else if (raw_data[2] == 'free') {
    this.free = true
  }
  this.raw_data = raw_data
  this.dict = dict
}


render_to_left(): any{
  var final = ""
  var raw_text = this.raw_data[1]
  var parts = raw_text.split(" ")
  for (let i = 0; i < parts.length; i++) {
    let result = parts[i].match("\{(.+)\}");
    if (result != null) {
      var variable = get_variable_by_name(result[1], this.dict)
        final = final + " " + variable.render_variable_left()
      }
    else{
      final = final + " " + parts[i]
    }
  }
  if (this.free) {
    final = ''
  }

  return final
}


}


@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-new-contract',
  templateUrl: './new-contract.component.html',
  styleUrls: ['./new-contract.component.css']
})


export class NewContractComponent implements OnInit {

  private _vars_jsonURL = '/assets/example2.csv';
  private _contract_jsonURL = '/assets/example.csv';

  visualize_main = false
  variables_dict = {}
  sections_dict = {}
  right_sections = []
  left_sections = []
  free_clauses = {}
  cur_section


  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
  .pipe(
    map(result => result.matches),
    shareReplay()
  );

  constructor(private breakpointObserver: BreakpointObserver) {}

  openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
  }
  
  closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
    document.body.style.backgroundColor = "white";
  }
    
  show_sections() : any{
    this.visualize_main = !this.visualize_main
    this.right_sections = Object.keys(this.variables_dict)
    this.left_sections = Object.keys(this.sections_dict)
    this.cur_section = this.right_sections[0]
  }

  parse_vars() :any{
    var variables_dict = {}
    Papa.parse(this._vars_jsonURL, {
      download: true,
      complete: function(results) {
        for (var i = 1; i < results.data.length; i++){
          if (results.data[i] != ""){
            var v = new InputVariable();
            v.init_var(results.data[i], variables_dict)
            if (!(results.data[i][0] in variables_dict)) {
              variables_dict[results.data[i][0]] = []
              variables_dict[results.data[i][0]].push(v)
            }
            else {
              variables_dict[results.data[i][0]].push(v)
            }
          }
        }}
    })
    return(variables_dict)  
  }

  parse_constract() :any{
    var temp_sections_dict = {}
    var temp_free_clauses = {}
    var dict = this.variables_dict
    Papa.parse(this._contract_jsonURL, {
      download: true,
      complete: function(results) {
        for (var i = 1; i < results.data.length; i++){
          if (results.data[i] != ""){
            
            var v = new Clause();
            v.init_clause(results.data[i], dict)
            if (!(results.data[i][0] in temp_sections_dict)) {
              temp_sections_dict[results.data[i][0]] = []
              temp_sections_dict[results.data[i][0]].push(v)

              temp_free_clauses[results.data[i][0]] = []
            }

            else {
              temp_sections_dict[results.data[i][0]].push(v)
            }

          } 
        }
      }
    })
    console.log(temp_sections_dict)
    console.log(temp_free_clauses)

    return({'sections': temp_sections_dict, 'free':temp_free_clauses})  
  }

  add_input_clause(section): any{
    this.free_clauses[section].push({value: '', show:1})
  }

  remove_input_clause(section, input): any{
    var idx = this.free_clauses[section].indexOf(input);
    this.free_clauses[section][idx].show = 0
  }

  ngOnInit() {
    this.variables_dict = this.parse_vars()
    let contrast_results = this.parse_constract()
    this.sections_dict = contrast_results.sections
    this.free_clauses = contrast_results.free

    
    console.log(this.sections_dict)
    console.log(this.free_clauses)

  
  }

  


}
