const test=require("node:test"),assert=require("node:assert/strict"),core=require("../wanted/core.js");
const valid={latitude:43.2389,longitude:76.8897,placeLabel:"Двор на Абая",locationType:"residential",reason:"Ближайшая зарядка всегда занята",frequency:"daily",chargerType:"ac",connectors:["Type 2"]};
test("validates a complete proposal",()=>assert.equal(core.validateProposal(valid).valid,true));
test("validates a proposal without placeLabel",()=>{const input={...valid};delete input.placeLabel;assert.equal(core.validateProposal(input).valid,true);});
test("validates a proposal without a frequency answer",()=>{const input={...valid};delete input.frequency;assert.equal(core.validateProposal(input).valid,true);});
test("keeps multiple optional connector selections",()=>assert.deepEqual(core.validateProposal({...valid,connectors:["GB/T","NACS"]}).value.connectors,["GB/T","NACS"]));
test("rejects coordinates outside Kazakhstan",()=>assert.equal(core.validateProposal({...valid,latitude:12}).errors.coordinates,"invalid"));
test("cleans unsafe user text",()=>assert.equal(core.clean(" <b> test </b> ",50),"b test /b"));
test("finds nearby proposals within 300 metres",()=>{const items=[{...valid,id:"near",status:"collecting_votes"},{...valid,id:"far",latitude:44,status:"collecting_votes"}];assert.deepEqual(core.nearby(items,valid,300).map(x=>x.id),["near"]);});
test("filters map records",()=>assert.equal(core.matches(valid,{locationType:"residential",chargerType:"ac"}),true));
test("accepts concise reason text",()=>assert.equal(core.validateProposal({...valid,reason:"Дом"}).valid,true));
test("pluralizes votes correctly in Russian",()=>{
  assert.equal(core.pluralVotes(1,"ru"),"голос");
  assert.equal(core.pluralVotes(2,"ru"),"голоса");
  assert.equal(core.pluralVotes(4,"ru"),"голоса");
  assert.equal(core.pluralVotes(5,"ru"),"голосов");
  assert.equal(core.pluralVotes(11,"ru"),"голосов");
  assert.equal(core.pluralVotes(21,"ru"),"голос");
  assert.equal(core.pluralVotes(22,"ru"),"голоса");
  assert.equal(core.pluralVotes(25,"ru"),"голосов");
});
test("pluralizes votes correctly in Kazakh and English",()=>{
  assert.equal(core.pluralVotes(1,"kk"),"дауыс");
  assert.equal(core.pluralVotes(5,"kk"),"дауыс");
  assert.equal(core.pluralVotes(1,"en"),"vote");
  assert.equal(core.pluralVotes(2,"en"),"votes");
});
