<?php

namespace App\Services;


use App\Data\ProductData;
use App\Data\ProductServiceData;
use App\Http\Integrations\IstTelecom\Requests\GetGoodsRequest;
use App\Http\Integrations\IstTelecom\Requests\WarehouseRequest;
use App\Http\Integrations\IstTelecom\Warehouse;
use App\Models\Documents;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DocumentService
{
    public function list(Request $request, $status)
    {
        $query = Documents::with(['user_info', 'document_type', 'products']);

        if ($status === 'draft') {
            $query->where('is_finished', false);
        } elseif ($status === 'sent') {
            $query->where('is_finished', true);
        }

        return $query->latest()->paginate(10);
    }

    public function create(Request $request)
    {
        $document = Documents::create([
            'user_id' => Auth::id(),
            'number' => $request->input('number'),
            'type' => $request->input('type'),
            'subscriber_title' => $request->input('subscriber_title'),
            'address' => $request->input('address'),
            'date_order' => $request->input('date_order'),
            'in_charge' => $request->input('in_charge'),
            'total_amount' => $request->input('total_amount'),
            'is_finished' => $request->input('is_finished', false),
        ]);

        if ($request->has('products')) {
            $document->products()->createMany($request->input('products'));
        }

        return $document;
    }
    public function getProductsFromApi($info){
        {
            $date = ($info['date'])??date('d.m.Y');
            $date = date('d.m.Y',strtotime($date));
            $foo_code = ($info['foo_code'])??null;
            $warehouse_code = ($info['warehouse_code'])??null;
            $dep_code = ($info['dep_code'])??null;
            $re = new GetGoodsRequest(date: $date, foo_code: $foo_code, dep_code: $dep_code, warehouse_code: $warehouse_code);
            $res = new Warehouse();
            $response = $res->send($re);
            $send = [];
            if ($response->successful()){
                $clean = str_replace('﻿','',$response->body());
                $items = json_decode($clean,true);
                foreach ($items as $value){
                    $send[] = new ProductServiceData(
                        $value['ОсновноеСредство'],
                        $this->numberFromStringForProduct($value['СтоимостьОстаток']),
                        $value['КоличествоОстаток'],
                        $this->numberFromStringForProduct($value['АмортизацияОстаток']),
                        $value['ПереоценкаОстаток'],
                        $value['ПодразделениеОрганизации'],
                        $value['СчетУчетаБУ'],
                        $value['СчетНачисленияАмортизацииБУ'],
                        $value['ОсновноеСредствоКод'],
                        $value['СкладКод'],
                        $value['МОЛКод'],
                        $value['ПодразделениеОрганизацииКод'],
                    );
                }
            }else{
                $status = $response->status();
                throw new \ErrorException("Ошибка подключения к серверу,ошибка: ".$status);

            }
            return $send;
        }
    }
    public function getGoods($code,$title,$date):array
    {
        $re = new WarehouseRequest(code:$code,warehouse_title:$title,date: $date);
        $res = new Warehouse();

        $send = [];
        $response = $res->send($re);
        if ($response->successful()){
            $clean = str_replace('﻿','',$response->body());
            $items = json_decode($clean,true);
            foreach ($items as $value){
                $send[] = new ProductData(
                    $value['Номенклатура'],
                    $value['Склад'],
                    $value['ЕдИзм'],
                    $this->numberFromStringForProduct($value['СуммаОстаток']),
                    $value['КоличествоОстаток'],
                    $value['КодНоменклатуры']
                );
            }
        }else{
            $status = $response->status();
            throw new \ErrorException("Ошибка подключения к серверу,ошибка: ".$status);
        }
        return $send;
    }
    public function numberFromStringForProduct(string $number): float
    {
        //vergullarni olib tashlash
        $number = str_replace(',','',$number);
        //so'mdagi summani tiyin qilish
        $number = $number*100;
        //raqamni formatini float qilish
        (float)$number = $number/100;
        return $number;
    }
}
