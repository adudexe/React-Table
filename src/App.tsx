import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Paginator } from "primereact/paginator";
import { useEffect, useRef, useState } from "react"
import { ProgressSpinner } from 'primereact/progressspinner';
import { OverlayPanel } from 'primereact/overlaypanel';
import axios from "axios";
import { toast } from "react-toastify";
import type { PaginatorPageChangeEvent } from 'primereact/paginator';
import type { ChangeEvent } from 'react';


interface Product {
  id: number;
  artist_title: string;
  department_title: string;
  classification_title: string;
  date_start: number;
}


function App() {

  const op = useRef<OverlayPanel>(null);
  const [products,setProducts] = useState<Product[]>([]);
  const [page,setPage] = useState(0);
  // const [rowClick,setRowClick] = useState(false);
  const rowClick = false;
  const [selectedProducts,setSelectedProducts] = useState<Product[]>([]);
  const [totalRecord,setTotalRecord] = useState<number>();
  const [loading,setLoading] = useState<any>();
  const [value,setValue] = useState(0);
  const [limit,setLimit] = useState(0); 
  const URL = import.meta.env.VITE_API_URL || 'https://api.artic.edu/api/v1/artworks';
  useEffect(() => {
    fetchData();
  },[page])

  const fetchData = async () => {
    try{
      setLoading(true);
      const res = await axios.get(`${URL}?page=${page+1}`);
      if (res.data.pagination && res.data.pagination.total) {
      setTotalRecord(res.data.pagination.total);
      }
      setProducts(res.data.data);
    } catch(err:any){
      setLoading(false);
      console.log("Error in Fetching",err);
    }
    finally{
      setLoading(false);
    }
  }

  const onPageChange = (e:PaginatorPageChangeEvent) => {
      setPage(e.page);
  }

  const inputHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(Number(e.target.value));
  }

  const addSelected = async () => {
    if(!value || value == 0){
      toast.error("Provide a valid value");
      return;
    } 
    if(value == limit){
      return;
    }
    if(value < selectedProducts.length){
      return 
    }

    const res = await axios.get(`${URL}?limit=${value}`);
    const newProducts = res.data.data
    const existingIds = new Set(selectedProducts.map(p => p.id));
    const uniqueProducts = newProducts.filter((p:Product) => !existingIds.has(p.id));
    setLimit(value);
    setSelectedProducts(prev => [...prev,...uniqueProducts]);
  }

  return (
    <>
    {loading ? <div style={{ display:"flex", justifyContent:"center", height:"100%", alignItems:'center' }}><ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" /></div>  : <><DataTable
      value={products} 
      selectionMode={rowClick ? null : 'checkbox'} 
      selection={selectedProducts} 
      onSelectionChange={(e:any) => setSelectedProducts(e.value)} 
      dataKey="id" 
      tableStyle={{ minWidth: '50rem' }}>
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>       
          <Column
            field="artist_title"
            header={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span style={{ margin: 0 }}>Artist</span>
                  <i className="pi pi-chevron-down"
                  style={{ marginLeft:'10px', cursor: 'pointer' }}
                  onClick={(e) => op.current?.toggle(e)}
                  />
                </div>}
          />
          <Column field="department_title" header="Department Title"></Column>
          <Column field="classification_title" header="Category"></Column>
          <Column field="date_start" header="Start Date"></Column>
      </DataTable> 
      <Paginator first={(page) * 12} rows={12} totalRecords={totalRecord}  onPageChange={onPageChange}/> 
      </>  }
      <OverlayPanel ref={op}>
        <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
          <input type="number" onChange={inputHandler} /> 
          <div>
            <button style={{ width:'5rem' }} onClick={addSelected}>Select</button>
          </div>
        </div>
      </OverlayPanel>
    </>
  )
}

export default App
