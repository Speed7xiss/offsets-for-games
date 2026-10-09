const XERO = "https://xerozify.xyz/api/offsets/games";
const GAMES = new Set(["cs2","fortnite","r6","rust","roblox","fivem","valorant","pubg"]);
function reply(res,status,data){res.setHeader("Content-Type","application/json; charset=utf-8");res.setHeader("Cache-Control","s-maxage=30, stale-while-revalidate=120");return res.status(status).json(data)}
export default async function handler(req,res){
 if(req.method!=="GET")return reply(res,405,{error:"Método não permitido."});
 const {game,type="current",id}=req.query||{};
 if(!GAMES.has(game))return reply(res,400,{error:"Jogo inválido."});
 if(!["current","builds","build"].includes(type))return reply(res,400,{error:"Consulta inválida."});
 const safeId=typeof id==="string"&&/^[a-zA-Z0-9._-]{1,120}$/.test(id)?id:"";
 if(type==="build"&&!safeId)return reply(res,400,{error:"ID da build inválido."});
 const sources=[];
 if(game==="roblox"){const path=type==="current"?"/roblox/current":type==="builds"?"/roblox/builds":"/roblox/builds/"+encodeURIComponent(safeId);sources.push({url:XERO+path,priority:true});}
 if(game==="cs2"&&type==="current"){const u=new URL("https://cs2-sdk.com/api/query");u.searchParams.set("signatures","CreateMove,GetInaccuracy");u.searchParams.set("offsets","dwEntityList,dwLocalPlayerPawn");u.searchParams.set("schemas","C_BaseEntity.m_iHealth,C_CSPlayerPawn.m_ArmorValue");u.searchParams.set("detail","1");sources.push({url:u.toString()})}
 if(game==="roblox"){const path=type==="current"?"/api/latest/raw":type==="builds"?"/api/version/raw":"/api/offset/"+encodeURIComponent(safeId)+"/raw";sources.push({url:"https://rbxoffsets.xyz"+path,headers:{"rbxoffsets.xyz":"apiv1"}})}
 if(game!=="roblox")sources.push({url:XERO+"/"+game+(type==="build"?"/builds/"+encodeURIComponent(safeId):"/"+type)});
 const errors=[];
 function useful(value,depth=0){if(depth>8||value==null)return false;if(Array.isArray(value))return value.length>0&&value.some(v=>useful(v,depth+1));if(typeof value==="object"){const entries=Object.entries(value).filter(([k])=>!["fetchedAt","updatedAt","timestamp","source","game","type","status","message","version","buildId","id"].includes(k));return entries.some(([k,v])=>/offset|signature|schema|address|pointer|data|result|build|version|value|name/i.test(k)?useful(v,depth+1):useful(v,depth+1))}if(typeof value==="string"){const t=value.trim();if(!t)return false;if((t.startsWith("{")&&t.endsWith("}"))||(t.startsWith("[")&&t.endsWith("]"))){try{return useful(JSON.parse(t),depth+1)}catch{}}return true}return typeof value==="number"||typeof value==="boolean"}
 for(const s of sources){try{const r=await fetch(s.url,{headers:{Accept:"application/json, text/plain, */*",...(s.headers||{})},signal:AbortSignal.timeout(12000)});const raw=await r.text();if(!r.ok){errors.push(new URL(s.url).hostname+": HTTP "+r.status);continue}let data;try{data=JSON.parse(raw)}catch{data=raw}if(game==="roblox"&&type==="current"&&!useful(data)){errors.push(new URL(s.url).hostname+": resposta vazia ou sem offsets");continue}return reply(res,200,{game,type,source:new URL(s.url).hostname,fetchedAt:new Date().toISOString(),data})}catch(e){errors.push(e?.name==="TimeoutError"?"Tempo limite excedido.":"Não foi possível conectar à API.")}}
 return reply(res,502,{error:"Nenhuma API respondeu com sucesso.",details:errors,hint:"A fonte pode estar indisponível ou ter alterado o formato."})
}